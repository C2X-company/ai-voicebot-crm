import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Campaign, Lead, Tenant, PlatformConfig } from '@/lib/models'; 

// Deep-Search helper
function extractData(obj: any, targetName: string): string | null {
  let foundValue: string | null = null;
  
  function search(current: any) {
    if (!current || typeof current !== 'object') return;
    
    if (current[targetName] && typeof current[targetName] === 'string') {
      foundValue = current[targetName];
      return;
    }
    
    if (current.name === targetName && current.result) {
      foundValue = current.result;
      return;
    }
    
    for (const key in current) {
      if (foundValue) return;
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

    const message = body.message || {};
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
      const fullTranscript = message.transcript || callData.transcript || "";

      // 3. 🚨 FIX: Extract Summary (Direct Check first, then deep search, then transcript fallback)
      let callSummary = 
        message.analysis?.summary || 
        message.summary || 
        callData.analysis?.summary || 
        extractData(body, 'summary') || 
        "";

      // Fallback summary generation if Vapi didn't provide one
      if (!callSummary && fullTranscript) {
        const lines = fullTranscript.split('\n').filter((l: string) => l.trim());
        if (lines.length > 0) {
          callSummary = `Call completed (${durationSeconds}s). ${lines.slice(0, 3).join(' ')}`;
        }
      }

      // 4. 🚨 FIX: Extract Audio Recording URL (Prefer public/stereo over private R2 HIPAA URLs)
      let audioUrl = 
        message.stereoRecordingUrl || 
        message.recordingUrl || 
        callData.stereoRecordingUrl || 
        callData.recordingUrl || 
        message.artifact?.stereoRecordingUrl || 
        message.artifact?.recordingUrl || 
        extractData(body, 'stereoRecordingUrl') || 
        extractData(body, 'recordingUrl') || 
        "";

      // 5. Calculate Intent
      const rawIntent = extractData(body, 'intentScore');
      let intent: 'Hot' | 'Warm' | 'Cold' = 'Cold'; // Default
      
      if (rawIntent) {
        const normalized = rawIntent.trim().toLowerCase();
        if (normalized === 'hot') intent = 'Hot';
        else if (normalized === 'warm') intent = 'Warm';
        else if (normalized === 'cold') intent = 'Cold';
      } 
      
      if (intent === 'Cold') {
        const summaryLower = (callSummary + " " + fullTranscript).toLowerCase();
        if (summaryLower.includes('very interested') || summaryLower.includes('apply') || summaryLower.includes('transfer')) {
          intent = 'Hot';
        } else if (summaryLower.includes('interested') || summaryLower.includes('fee') || summaryLower.includes('admission')) {
          intent = 'Warm';
        }
      }

      // Extract tenant/org ID
      const activeOrgId = callData.metadata?.orgId || message.call?.metadata?.orgId;
      
      console.log(`Attempting to update lead: ${customerNumber} for Org: ${activeOrgId}`);
      
      // Update Lead in MongoDB
      const updatedLead = await Lead.findOneAndUpdate(
        { 
          phone: customerNumber,
          ...(activeOrgId ? { tenantId: activeOrgId } : {})
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

      // Update Campaign Stats
      if (updatedLead && updatedLead.campaignId) {
        await Campaign.findByIdAndUpdate(updatedLead.campaignId, {
          $inc: { completedCalls: 1 }
        });
        
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
          const nextLead = await Lead.findOne({ 
            status: 'Queued',
            campaignId: updatedLead.campaignId
          }).sort({ createdAt: 1 });

          if (nextLead) {
            console.log(`📞 Passing the baton! Next lead is: ${nextLead.phone}`);
            
            await Lead.findByIdAndUpdate(nextLead._id, { status: 'Calling' });

            console.log(`⏳ Waiting 3 seconds to prevent channel overlap...`);
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Fetch keys for relay call
            let vapiKey = process.env.VAPI_KEY;
            if (!vapiKey) {
              const tenant = await Tenant.findOne({ orgId: updatedLead.tenantId }).lean();
              vapiKey = tenant?.apiKeys?.vapi;
              if (!vapiKey) {
                const globalConfig = await PlatformConfig.findOne().lean();
                vapiKey = globalConfig?.masterApiKeys?.vapi;
              }
            }

            // 🚨 UPDATED: New Assistant & Phone IDs
            const ASSISTANT_ID = process.env.VAPI_ASSISTANT_ID || "b9e32915-6885-4814-819f-3f32d179ee67";
            const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID || "5900a887-8044-4953-a946-f46d7d7cf74b";

            const vapiResponse = await fetch('https://api.vapi.ai/call/phone', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${vapiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                assistantId: ASSISTANT_ID,
                phoneNumberId: PHONE_NUMBER_ID,
                customer: {
                  number: nextLead.phone,
                  name: nextLead.name
                },
                metadata: {
                  orgId: updatedLead.tenantId
                }
              }),
            });

            if (!vapiResponse.ok) {
              const errData = await vapiResponse.text();
              console.error(`❌ Relay API rejected call for ${nextLead.phone}:`, errData);
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
