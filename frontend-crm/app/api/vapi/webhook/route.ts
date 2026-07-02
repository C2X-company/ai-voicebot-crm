import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Campaign, Lead } from '@/lib/models'; 

// 🚀 THE FIX: A Deep-Search helper that finds your data NO MATTER WHERE Vapi hides it
function extractData(obj: any, targetName: string): string | null {
  let foundValue: string | null = null;
  
  function search(current: any) {
    if (!current || typeof current !== 'object') return;
    
    // Pattern 1: Direct key-value {"intentScore": "Hot"}
    if (current[targetName] && typeof current[targetName] === 'string') {
      foundValue = current[targetName];
      return;
    }
    
    // Pattern 2: Vapi UUID map {"uuid": { name: "intentScore", result: "Hot" }}
    if (current.name === targetName && current.result) {
      foundValue = current.result;
      return;
    }
    
    // Recursive drill-down
    for (const key in current) {
      if (foundValue) return; // Stop searching if we already found it
      search(current[key]);
    }
  }
  
  search(obj);
  return foundValue;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // CRUCIAL GUARD: Only save to DB when Vapi has finalized the post-call report
    if (body.message?.type !== "end-of-call-report") {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const message = body.message;
    const callData = message.call || {};
    
    let customerNumber = callData.customer?.number || message.customer?.number;
    
    if (customerNumber) {
      customerNumber = customerNumber.replace(/[\s()-]/g, '');
      await connectToDatabase();

      // 1. Aggressive Duration Extraction
      let durationSeconds = 0;
      
      const startStr = callData.startedAt || message.startedAt || callData.createdAt;
      const endStr = callData.endedAt || message.endedAt;
      
      if (startStr && endStr) {
        const startMs = new Date(startStr).getTime();
        const endMs = new Date(endStr).getTime();
        if (!isNaN(startMs) && !isNaN(endMs)) {
            durationSeconds = Math.floor((endMs - startMs) / 1000);
        }
      }

      if (!durationSeconds || durationSeconds <= 0 || isNaN(durationSeconds)) {
        const rawDuration = message.duration || callData.duration || message.durationSeconds;
        
        if (rawDuration !== undefined && rawDuration !== null) {
            const parsedNum = Number(rawDuration);
            if (!isNaN(parsedNum)) {
                durationSeconds = parsedNum > 10000 ? Math.floor(parsedNum / 1000) : Math.floor(parsedNum);
            }
        }
      }
      
      if (isNaN(durationSeconds) || durationSeconds < 0) {
          durationSeconds = 0;
      }

      // 2. Extract Transcript
      const fullTranscript = message.transcript || "";

      // 3. Extract Summary & Intent & Audio
      const rawIntent = extractData(body, 'intentScore');
      let callSummary = extractData(body, 'summary') || "";
      
      // 🚨 FIX: Use the Deep-Search helper to hunt down the MP3 link!
      let audioUrl = extractData(body, 'recordingUrl') || message.recordingUrl || callData.recordingUrl || "";

      // 4. Calculate Intent
      let intent: 'Hot' | 'Warm' | 'Cold' = 'Cold'; // Default
      
      if (rawIntent) {
        const normalized = rawIntent.trim().toLowerCase();
        if (normalized === 'hot') intent = 'Hot';
        else if (normalized === 'warm') intent = 'Warm';
        else if (normalized === 'cold') intent = 'Cold';
      } 
      
      if (intent === 'Cold') {
          const summaryLower = callSummary.toLowerCase();
          if (summaryLower.includes('very interested') || summaryLower.includes('apply') || summaryLower.includes('transfer')) {
            intent = 'Hot';
          } else if (summaryLower.includes('interested') || summaryLower.includes('fee')) {
            intent = 'Warm';
          }
      }

      // 🚨 FIX: Extract the orgId that we passed to Vapi when we started the call
      const activeOrgId = callData.metadata?.orgId || message.call?.metadata?.orgId;
      
      console.log(`Attempting to update lead: ${customerNumber} for Org: ${activeOrgId}`);
      // 5. Update the Current Lead in MongoDB
      const updatedLead = await Lead.findOneAndUpdate(
        { phone: customerNumber,
          tenantId: activeOrgId // 🚨 CRITICAL FIX
         },
        {
          status: intent === 'Hot' ? 'Converted' : 'Called',
          intentScore: intent,
          callDuration: durationSeconds,
          transcript: fullTranscript, 
          summary: callSummary,
          recordingUrl: audioUrl
        },
        { new: true }
      );
      
      console.log(`✅ Webhook processed for ${customerNumber}: ${intent} Lead. Duration: ${durationSeconds}s`);

      // 🚨 NEW: 5.5 Update the Campaign Stats!
      if (updatedLead && updatedLead.campaignId) {
        // If the lead was converted, we increase both completedCalls AND converted count
        const isConverted = updatedLead.status === 'Converted';
        
        // Find the campaign and increment completedCalls by 1
        await Campaign.findByIdAndUpdate(updatedLead.campaignId, {
          $inc: { 
            completedCalls: 1 
          }
        });
        
        // Let's recalculate the conversion rate for the campaign
        const campaignStats = await Campaign.findById(updatedLead.campaignId);
        if (campaignStats) {
           const allConverted = await Lead.countDocuments({ 
             campaignId: updatedLead.campaignId, 
             status: 'Converted' 
           });
           
           const newConversionRate = campaignStats.completedCalls > 0 
             ? (allConverted / campaignStats.completedCalls) * 100 
             : 0;
             
           await Campaign.findByIdAndUpdate(updatedLead.campaignId, {
             conversionRate: newConversionRate
           });
           console.log(`📊 Campaign Stats Updated! Calls: ${campaignStats.completedCalls}, Conv: ${newConversionRate}%`);
        }
      }
      
      // ─────────────────────────────────────────────────────────────────
      // 6. THE SEQUENTIAL RELAY PASS (Trigger the next call)
      // ─────────────────────────────────────────────────────────────────
      
      if (updatedLead) {
        try {
          // Lock the query to ONLY the current campaign to prevent crossing wires
          const nextLead = await Lead.findOne({ 
            status: 'Queued',
            campaignId: updatedLead.campaignId
          }).sort({ createdAt: 1 });

          if (nextLead) {
            console.log(`📞 Passing the baton! Next lead is: ${nextLead.phone}`);
            
            // Mark as calling so we don't double-dial
            await Lead.findByIdAndUpdate(nextLead._id, { status: 'Calling' });

            // 🚨 THE CRITICAL DELAY: Wait 3 seconds for the telecom channel to clear!
            console.log(`⏳ Waiting 3 seconds to prevent Exotel/Twilio channel overlap...`);
            await new Promise(resolve => setTimeout(resolve, 3000));

            const VAPI_KEY = process.env.VAPI_KEY || "4cacfd17-5214-43d6-b3d5-7aab7e4a1596";
            const ASSISTANT_ID = process.env.VAPI_ASSISTANT_ID || "591db43a-b673-4aa2-b1e0-d39c3b60eeef";
            const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID || "6b926cfa-66c7-422c-9161-20445e21f435";

            // Fire the Vapi API
            const vapiResponse = await fetch('https://api.vapi.ai/call/phone', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${VAPI_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                assistantId: ASSISTANT_ID,
                phoneNumberId: PHONE_NUMBER_ID,
                customer: {
                  number: nextLead.phone,
                  name: nextLead.name
                },
                // 🚨 ADD THIS: Pass the Organization ID to Vapi
              metadata: {
                  orgId: updatedLead.tenantId // This is the Clerk orgId saved on the lead!
              }
              }),
            });

            if (!vapiResponse.ok) {
              const errData = await vapiResponse.text();
              console.error(`❌ Relay API rejected the call for ${nextLead.phone}:`, errData);
              // Revert status on failure so it can be retried later
              await Lead.findByIdAndUpdate(nextLead._id, { status: 'Queued' });
            } else {
              console.log(`✅ Next call triggered successfully!`);
            }

          } else {
            console.log(`🏁 Campaign Complete! All queued leads have been called.`);
          }
        } catch (relayError) {
          console.error(`❌ Relay logic crashed:`, relayError);
        }
      }
    }

    return NextResponse.json({ success: true, received: true });
    
  } catch (error) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json({ success: false, error: 'Webhook processing failed' }, { status: 500 });
  }
}