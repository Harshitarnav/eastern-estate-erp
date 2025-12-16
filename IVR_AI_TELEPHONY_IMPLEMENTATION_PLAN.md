# IVR, Round-Robin, Number Masking & AI Call Intelligence Implementation Plan

## 🎯 Executive Summary

This document outlines the complete implementation plan for adding telephony features to Eastern Estate ERP:

1. **IVR System** - Automated call routing with menu options
2. **Round-Robin Distribution** - Fair call distribution among sales team
3. **Number Masking** - Privacy protection for customers and agents
4. **AI-Powered Features:**
   - Automatic lead updates from call content
   - Call recording transcription
   - AI-powered call summaries
   - Sentiment analysis
   - Next action suggestions

**Estimated Timeline:** 4-6 weeks
**Budget Estimate:** ₹50,000 - ₹2,00,000 (depending on call volume)

---

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Customer/Lead                            │
│                    Calls: 1800-XXX-XXXX                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Telephony Provider (Twilio/Exotel)             │
│  • IVR Menu ("Press 1 for Sales, 2 for Support...")        │
│  • Call Recording                                            │
│  • Number Masking                                            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Eastern Estate Backend (NestJS)                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Call Management Service                            │   │
│  │  • Webhook Handler                                   │   │
│  │  • Round-Robin Algorithm                            │   │
│  │  • Call Logging & Tracking                          │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  AI Intelligence Service                            │   │
│  │  • Transcription (Whisper API)                      │   │
│  │  • Summarization (GPT-4)                            │   │
│  │  • Lead Extraction & Updates                        │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              PostgreSQL Database                             │
│  • call_logs                                                 │
│  • agent_availability                                        │
│  • call_recordings                                           │
│  • call_transcriptions                                       │
└─────────────────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Eastern Estate Frontend (Next.js)               │
│  • Real-time Call Dashboard                                  │
│  • Agent Status Management                                   │
│  • Call History & Recordings                                 │
│  • AI Insights Display                                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

### Telephony Provider Options

| Provider | Pros | Cons | Monthly Cost (est.) |
|----------|------|------|---------------------|
| **Exotel** (Recommended for India) | • India-focused<br>• Good documentation<br>• Reliable<br>• Number masking built-in | • Limited to India/SEA | ₹2,000 - ₹50,000 |
| **Twilio** | • Global leader<br>• Excellent APIs<br>• Advanced features | • Expensive for India<br>• Requires international payments | $50 - $500 (₹4,000 - ₹40,000) |
| **Knowlarity** | • India-focused<br>• Good for enterprises<br>• TRAI compliant | • Higher setup cost<br>• Less developer-friendly | ₹5,000 - ₹75,000 |
| **Ozonetel** | • Cloud contact center<br>• India-based | • Complex setup<br>• Enterprise pricing | Custom pricing |

**Recommendation:** Start with **Exotel** for India market or **Twilio** for global reach.

### AI Services

| Service | Use Case | Monthly Cost |
|---------|----------|--------------|
| **OpenAI GPT-4** | Call summarization, lead extraction | $20 - $200 |
| **OpenAI Whisper** | Speech-to-text transcription | $0.006/minute |
| **Google Cloud Speech-to-Text** | Alternative transcription | $0.006/minute |
| **AssemblyAI** | Transcription + Sentiment analysis | $0.00025/second |

**Recommendation:** **OpenAI Whisper + GPT-4** for best quality and cost.

---

## 📋 Phase 1: Database Schema & Backend Setup (Week 1)

### 1. Database Schema

```sql
-- Create telephony schema
CREATE SCHEMA IF NOT EXISTS telephony;

-- Agent availability tracking
CREATE TABLE telephony.agent_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    is_available BOOLEAN DEFAULT true,
    status VARCHAR(20) DEFAULT 'AVAILABLE', -- AVAILABLE, ON_CALL, BREAK, OFFLINE
    phone_number VARCHAR(20),
    extension VARCHAR(10),
    max_concurrent_calls INTEGER DEFAULT 1,
    current_calls INTEGER DEFAULT 0,
    total_calls_today INTEGER DEFAULT 0,
    last_call_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_status CHECK (status IN ('AVAILABLE', 'ON_CALL', 'BREAK', 'OFFLINE'))
);

-- Call logs table
CREATE TABLE telephony.call_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Call identification
    call_sid VARCHAR(100) UNIQUE, -- Provider's call ID
    direction VARCHAR(20), -- INBOUND, OUTBOUND
    
    -- Participants
    from_number VARCHAR(20),
    to_number VARCHAR(20),
    masked_number VARCHAR(20), -- The masked number shown
    customer_id UUID REFERENCES customers(id),
    lead_id UUID REFERENCES leads(id),
    assigned_agent_id UUID REFERENCES employees(id),
    
    -- Call details
    status VARCHAR(20), -- QUEUED, RINGING, IN_PROGRESS, COMPLETED, FAILED, BUSY, NO_ANSWER
    duration INTEGER, -- in seconds
    call_type VARCHAR(50), -- SALES, SUPPORT, GENERAL, CALLBACK
    ivr_selection VARCHAR(50), -- Which IVR option was selected
    
    -- Round-robin tracking
    queue_position INTEGER,
    wait_time INTEGER, -- seconds in queue
    ring_time INTEGER, -- seconds ringing before answer
    
    -- Recording & transcription
    recording_url TEXT,
    recording_duration INTEGER,
    transcription_text TEXT,
    transcription_status VARCHAR(20), -- PENDING, IN_PROGRESS, COMPLETED, FAILED
    
    -- AI analysis
    ai_summary TEXT,
    sentiment VARCHAR(20), -- POSITIVE, NEUTRAL, NEGATIVE, MIXED
    intent VARCHAR(100), -- NEW_INQUIRY, FOLLOW_UP, COMPLAINT, BOOKING, etc.
    key_topics JSONB, -- ["pricing", "location", "amenities"]
    action_items JSONB, -- [{"action": "Send brochure", "priority": "high"}]
    
    -- Timestamps
    queued_at TIMESTAMP,
    answered_at TIMESTAMP,
    ended_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Metadata
    metadata JSONB, -- Additional provider-specific data
    
    CONSTRAINT valid_direction CHECK (direction IN ('INBOUND', 'OUTBOUND')),
    CONSTRAINT valid_call_status CHECK (status IN ('QUEUED', 'RINGING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'BUSY', 'NO_ANSWER', 'CANCELLED'))
);

-- Call recordings table (separate for better organization)
CREATE TABLE telephony.call_recordings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_log_id UUID REFERENCES telephony.call_logs(id) ON DELETE CASCADE,
    recording_url TEXT NOT NULL,
    recording_sid VARCHAR(100), -- Provider's recording ID
    duration INTEGER,
    file_size INTEGER, -- in bytes
    format VARCHAR(10), -- mp3, wav, etc.
    storage_location TEXT, -- S3/Local path
    is_processed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Call transcriptions table
CREATE TABLE telephony.call_transcriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_log_id UUID REFERENCES telephony.call_logs(id) ON DELETE CASCADE,
    recording_id UUID REFERENCES telephony.call_recordings(id),
    
    -- Transcription data
    full_text TEXT,
    segments JSONB, -- [{speaker: "agent", text: "Hello...", timestamp: 0}]
    language VARCHAR(10) DEFAULT 'en',
    confidence_score DECIMAL(5,2), -- 0-100
    
    -- Processing
    provider VARCHAR(50), -- whisper, google, assemblyai
    processing_status VARCHAR(20), -- PENDING, IN_PROGRESS, COMPLETED, FAILED
    processing_time INTEGER, -- milliseconds
    error_message TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI insights table
CREATE TABLE telephony.ai_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_log_id UUID REFERENCES telephony.call_logs(id) ON DELETE CASCADE,
    transcription_id UUID REFERENCES telephony.call_transcriptions(id),
    
    -- AI-generated insights
    summary TEXT,
    detailed_summary TEXT,
    sentiment VARCHAR(20),
    sentiment_score DECIMAL(5,2), -- -1 to 1
    
    -- Extracted information
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    customer_phone VARCHAR(20),
    budget_mentioned DECIMAL(15,2),
    preferred_location TEXT,
    property_requirements JSONB,
    timeline VARCHAR(50), -- IMMEDIATE, 1_MONTH, 3_MONTHS, 6_MONTHS, 1_YEAR
    
    -- Intent & topics
    primary_intent VARCHAR(100),
    secondary_intents TEXT[],
    key_topics TEXT[],
    mentioned_properties TEXT[],
    
    -- Action items
    action_items JSONB,
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_date DATE,
    priority VARCHAR(20), -- LOW, MEDIUM, HIGH, URGENT
    
    -- Lead scoring
    lead_quality_score INTEGER, -- 0-100
    conversion_probability DECIMAL(5,2), -- 0-100
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Round-robin queue configuration
CREATE TABLE telephony.round_robin_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department VARCHAR(50) NOT NULL, -- SALES, SUPPORT, PROPERTY_INQUIRY
    algorithm VARCHAR(20) DEFAULT 'ROUND_ROBIN', -- ROUND_ROBIN, LEAST_BUSY, SKILL_BASED
    max_queue_size INTEGER DEFAULT 100,
    max_wait_time INTEGER DEFAULT 300, -- seconds
    overflow_action VARCHAR(50), -- VOICEMAIL, CALLBACK, TRANSFER
    overflow_number VARCHAR(20),
    priority_rules JSONB,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_call_logs_customer ON telephony.call_logs(customer_id);
CREATE INDEX idx_call_logs_lead ON telephony.call_logs(lead_id);
CREATE INDEX idx_call_logs_agent ON telephony.call_logs(assigned_agent_id);
CREATE INDEX idx_call_logs_created ON telephony.call_logs(created_at DESC);
CREATE INDEX idx_call_logs_status ON telephony.call_logs(status);
CREATE INDEX idx_agent_availability_status ON telephony.agent_availability(status);
CREATE INDEX idx_ai_insights_call ON telephony.ai_insights(call_log_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_agent_availability_updated_at BEFORE UPDATE ON telephony.agent_availability
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_call_logs_updated_at BEFORE UPDATE ON telephony.call_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_call_transcriptions_updated_at BEFORE UPDATE ON telephony.call_transcriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_insights_updated_at BEFORE UPDATE ON telephony.ai_insights
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## 🔧 Phase 2: Backend Implementation (Week 2-3)

### Project Structure

```
backend/src/modules/telephony/
├── telephony.module.ts
├── controllers/
│   ├── webhooks.controller.ts          # Handle provider webhooks
│   ├── calls.controller.ts             # Call management API
│   ├── agents.controller.ts            # Agent availability API
│   └── recordings.controller.ts        # Recording & transcription API
├── services/
│   ├── ivr.service.ts                  # IVR logic
│   ├── round-robin.service.ts          # Call distribution
│   ├── number-masking.service.ts       # Number masking
│   ├── call-tracking.service.ts        # Call logging
│   ├── recording.service.ts            # Recording management
│   ├── transcription.service.ts        # Speech-to-text
│   ├── ai-analysis.service.ts          # AI insights
│   └── provider/
│       ├── telephony-provider.interface.ts
│       ├── exotel.service.ts
│       └── twilio.service.ts
├── entities/
│   ├── call-log.entity.ts
│   ├── agent-availability.entity.ts
│   ├── call-recording.entity.ts
│   ├── call-transcription.entity.ts
│   └── ai-insight.entity.ts
├── dto/
│   ├── create-call.dto.ts
│   ├── webhook-payload.dto.ts
│   ├── update-agent-status.dto.ts
│   └── ai-analysis.dto.ts
└── guards/
    └── webhook-signature.guard.ts
```

### Key Configuration

```typescript
// backend/.env additions
# Telephony Provider (Exotel)
EXOTEL_API_KEY=your_api_key
EXOTEL_API_TOKEN=your_api_token
EXOTEL_SID=your_exotel_sid
EXOTEL_PHONE_NUMBER=+911800XXXXXX
EXOTEL_WEBHOOK_BASE_URL=https://your-domain.com/api/telephony/webhooks

# AI Services
OPENAI_API_KEY=sk-xxx
OPENAI_MODEL=gpt-4-turbo-preview
WHISPER_MODEL=whisper-1

# Call Recording Storage
RECORDING_STORAGE=s3  # or 'local'
AWS_S3_BUCKET=eastern-estate-recordings
AWS_REGION=ap-south-1

# Round Robin Config
MAX_CONCURRENT_CALLS_PER_AGENT=2
MAX_QUEUE_WAIT_TIME=300  # 5 minutes
DEFAULT_OVERFLOW_ACTION=VOICEMAIL
```

---

## 💻 Phase 3: Frontend Implementation (Week 3-4)

### UI Components to Create

```
frontend/src/app/(dashboard)/telephony/
├── dashboard/
│   └── page.tsx                    # Real-time call dashboard
├── calls/
│   ├── page.tsx                    # Call history
│   └── [id]/
│       └── page.tsx                # Call details with AI insights
├── agents/
│   └── page.tsx                    # Agent availability management
├── recordings/
│   └── page.tsx                    # Recording library
└── settings/
    └── page.tsx                    # IVR & routing configuration

frontend/src/components/telephony/
├── CallDashboard.tsx               # Real-time dashboard widget
├── AgentStatusCard.tsx             # Agent availability card
├── CallDetailsModal.tsx            # Detailed call info
├── AIInsightsPanel.tsx             # AI analysis display
├── CallRecordingPlayer.tsx         # Audio player with transcript
├── TranscriptViewer.tsx            # Formatted transcript
├── CallActionsMenu.tsx             # Quick actions
└── LiveCallIndicator.tsx           # Live call status
```

---

## 🎯 Phase 4: AI Integration (Week 4-5)

### AI Processing Pipeline

```typescript
// Pseudocode for AI processing flow

1. Call Ends
   ↓
2. Download Recording from Provider
   ↓
3. Upload to S3/Local Storage
   ↓
4. Send to Whisper API for Transcription
   ↓
5. Get Transcription with Timestamps
   ↓
6. Send to GPT-4 for Analysis:
   - Generate summary
   - Extract lead information
   - Identify sentiment
   - Find action items
   - Score lead quality
   ↓
7. Update Lead/Customer Record Automatically
   ↓
8. Create Follow-up Tasks
   ↓
9. Notify Agent via Dashboard/Email
```

---

## 📝 Phase 5: Testing & Deployment (Week 5-6)

### Testing Checklist

- [ ] IVR menu works correctly
- [ ] Calls route to available agents
- [ ] Round-robin distributes evenly
- [ ] Number masking hides real numbers
- [ ] Call recording works
- [ ] Transcription is accurate
- [ ] AI summary is useful
- [ ] Lead updates are correct
- [ ] Dashboard shows real-time data
- [ ] Mobile responsive
- [ ] Webhooks are reliable

---

## 💰 Cost Breakdown (Monthly)

| Component | Cost (INR) | Notes |
|-----------|------------|-------|
| Exotel/Twilio | ₹5,000 - ₹30,000 | Based on call volume |
| OpenAI API | ₹1,500 - ₹15,000 | Based on usage |
| AWS S3 Storage | ₹500 - ₹2,000 | For recordings |
| Server Resources | ₹2,000 - ₹5,000 | Extra processing power |
| **Total** | **₹9,000 - ₹52,000** | **Per month** |

**Assumptions:** 1000 calls/month, 5-minute avg duration, 80% transcribed

---

## 🚀 Quick Start Implementation

I'll create starter files for you in the next message. Tell me:

1. **Which telephony provider** do you want to use? (Exotel recommended for India)
2. **Do you have accounts** with OpenAI and the telephony provider?
3. **What's your priority?**
   - Start with basic call logging?
   - Go straight to full IVR + AI?
4. **Expected call volume?** (calls per day/month)
5. **Number of agents?** (for round-robin setup)

---

## 📚 Next Steps

### Immediate (This Week):
1. ✅ Review this plan
2. ✅ Choose telephony provider
3. ✅ Sign up for Exotel/Twilio
4. ✅ Get OpenAI API key
5. ✅ Run database migrations

### Week 1-2: Backend
- Implement database schema
- Set up provider integration
- Create webhook handlers
- Build round-robin logic

### Week 3-4: Frontend
- Create call dashboard
- Build agent management UI
- Add call history
- Implement AI insights display

### Week 5-6: AI & Testing
- Integrate Whisper for transcription
- Set up GPT-4 analysis
- Test all features
- Deploy to production

---

## 🎓 Learning Resources

- **Exotel API Docs:** https://developer.exotel.com/
- **Twilio Docs:** https://www.twilio.com/docs
- **OpenAI Whisper:** https://platform.openai.com/docs/guides/speech-to-text
- **WebRTC for Browser Calls:** https://webrtc.org/
- **SIP Trunking:** For advanced PBX integration

---

## ⚡ Quick Win Option

Want to start small? I can help you implement:

**Phase 0: Basic Call Tracking (1 week)**
- Manual call logging
- Link calls to leads/customers
- Basic recording upload
- Simple reporting

Then scale up to full IVR + AI later!

---

Ready to start? Let me know your preferences and I'll generate the actual code files! 🚀


