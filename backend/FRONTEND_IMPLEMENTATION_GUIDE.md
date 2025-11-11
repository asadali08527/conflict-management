# Frontend Implementation Guide - Multi-Party Case Submission

This guide provides detailed instructions for implementing the Party A and Party B submission flows in your frontend application.

---

## Table of Contents
1. [API Endpoints Overview](#api-endpoints-overview)
2. [Party A Flow (Original Submitter)](#party-a-flow-original-submitter)
3. [Party B Flow (Respondent)](#party-b-flow-respondent)
4. [Admin Dashboard Integration](#admin-dashboard-integration)
5. [UI/UX Components](#uiux-components)
6. [Error Handling](#error-handling)
7. [Testing Scenarios](#testing-scenarios)

---

## API Endpoints Overview

### Base URL
```
http://localhost:5000/api
```

### Authentication
All authenticated endpoints require JWT token in header:
```javascript
headers: {
  'Authorization': 'Bearer YOUR_JWT_TOKEN',
  'Content-Type': 'application/json'
}
```

### Available Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/case-submission/session` | POST | Optional | Create new session (Party A) |
| `/case-submission/join-case` | POST | Optional | Join existing case (Party B) |
| `/case-submission/session/:sessionId` | GET | No | Get session data |
| `/case-submission/step1` | POST | Required | Submit step 1 data |
| `/case-submission/step2` | POST | Required | Submit step 2 data |
| `/case-submission/step3` | POST | Required | Submit step 3 data |
| `/case-submission/step4` | POST | Required | Submit step 4 data |
| `/case-submission/step5` | POST | Required | Submit step 5 data |
| `/case-submission/step6` | POST | Required | Submit step 6 with files |
| `/case-submission/submit` | POST | Required | Final submission |
| `/cases/:id/full-details` | GET | Required (Admin) | View both parties' data |

---

## Party A Flow (Original Submitter)

### Step 1: Create Session

**When:** User lands on `/submit-case` page

```javascript
// API Call
const createSession = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/case-submission/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}` // Optional if user is logged in
      },
      body: JSON.stringify({
        userId: loggedInUserId, // Optional
        startedAt: new Date().toISOString()
      })
    });

    const data = await response.json();

    if (data.success) {
      // Store sessionId in state/localStorage
      localStorage.setItem('sessionId', data.sessionId);
      console.log('Session created:', data.sessionId);
      // Proceed to Step 1 form
    }
  } catch (error) {
    console.error('Error creating session:', error);
  }
};
```

**Response:**
```json
{
  "success": true,
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Session created successfully",
  "startedAt": "2025-01-15T10:30:00.000Z"
}
```

### Step 2-6: Submit Each Step

**Example: Step 1 - Case Overview**

```javascript
const submitStep1 = async (formData) => {
  const sessionId = localStorage.getItem('sessionId');

  try {
    const response = await fetch('http://localhost:5000/api/case-submission/step1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        stepId: 1,
        sessionId: sessionId,
        caseOverview: {
          conflictType: formData.conflictType, // e.g., "Marital Conflict"
          description: formData.description,
          urgencyLevel: formData.urgencyLevel, // "low" | "medium" | "high" | "urgent"
          estimatedValue: formData.estimatedValue // Optional
        }
      })
    });

    const data = await response.json();

    if (data.success) {
      console.log('Step 1 saved successfully');
      // Navigate to Step 2
      navigateToStep(2);
    }
  } catch (error) {
    console.error('Error submitting step 1:', error);
  }
};
```

**Step 2 - Parties Involved**

```javascript
const submitStep2 = async (formData) => {
  const sessionId = localStorage.getItem('sessionId');

  const response = await fetch('http://localhost:5000/api/case-submission/step2', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`
    },
    body: JSON.stringify({
      stepId: 2,
      sessionId: sessionId,
      partiesInvolved: {
        parties: [
          {
            name: "John Doe",
            role: "Spouse/Partner",
            email: "john@example.com",
            phone: "+1234567890", // Optional
            relationship: "Married Couple"
          },
          {
            name: "Jane Doe",
            role: "Spouse/Partner",
            email: "jane@example.com",
            phone: "+1234567891",
            relationship: "Married Couple"
          }
        ]
      }
    })
  });
};
```

**Step 3 - Conflict Background**

```javascript
const submitStep3 = async (formData) => {
  const sessionId = localStorage.getItem('sessionId');

  const response = await fetch('http://localhost:5000/api/case-submission/step3', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`
    },
    body: JSON.stringify({
      stepId: 3,
      sessionId: sessionId,
      conflictBackground: {
        timeline: "The conflict started in January 2024...",
        keyIssues: [
          "Financial disagreements",
          "Communication breakdown",
          "Trust issues"
        ],
        previousAttempts: "We tried couples counseling in March 2024...",
        emotionalImpact: "Both parties are experiencing significant stress..."
      }
    })
  });
};
```

**Step 4 - Desired Outcomes**

```javascript
const submitStep4 = async (formData) => {
  const sessionId = localStorage.getItem('sessionId');

  const response = await fetch('http://localhost:5000/api/case-submission/step4', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`
    },
    body: JSON.stringify({
      stepId: 4,
      sessionId: sessionId,
      desiredOutcomes: {
        primaryGoals: [
          "Fair division of assets",
          "Custody arrangement for children",
          "Peaceful resolution"
        ],
        successMetrics: "Both parties feel heard and the agreement is sustainable",
        constraints: "Must be resolved within 3 months",
        timeline: "3-6 months"
      }
    })
  });
};
```

**Step 5 - Scheduling Preferences**

```javascript
const submitStep5 = async (formData) => {
  const sessionId = localStorage.getItem('sessionId');

  const response = await fetch('http://localhost:5000/api/case-submission/step5', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`
    },
    body: JSON.stringify({
      stepId: 5,
      sessionId: sessionId,
      schedulingPreferences: {
        availability: [
          "Weekday mornings",
          "Tuesday afternoons",
          "Thursday evenings"
        ],
        preferredLocation: "online", // "online" | "in-person" | "hybrid"
        timeZone: "America/New_York",
        communicationPreference: "email" // "email" | "phone" | "text" | "app"
      }
    })
  });
};
```

**Step 6 - Document Upload**

```javascript
const submitStep6 = async (files, descriptions) => {
  const sessionId = localStorage.getItem('sessionId');

  // Create FormData for file upload
  const formData = new FormData();
  formData.append('stepId', '6');
  formData.append('sessionId', sessionId);

  // Add files
  files.forEach(file => {
    formData.append('files', file);
  });

  // Add descriptions as JSON string
  formData.append('descriptions', JSON.stringify(descriptions));

  const response = await fetch('http://localhost:5000/api/case-submission/step6', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${userToken}`
      // Don't set Content-Type, browser will set it with boundary
    },
    body: formData
  });

  const data = await response.json();
  console.log('Uploaded files:', data.uploadedFiles);
};
```

### Final Submission (Party A)

```javascript
const finalSubmit = async () => {
  const sessionId = localStorage.getItem('sessionId');

  try {
    const response = await fetch('http://localhost:5000/api/case-submission/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        sessionId: sessionId,
        submittedAt: new Date().toISOString(),
        submitterUserId: loggedInUserId // Optional
      })
    });

    const data = await response.json();

    if (data.success) {
      console.log('Case submitted:', data.caseId);

      // Show success message with caseId
      showSuccessMessage({
        caseId: data.caseId,
        message: data.message,
        nextSteps: data.nextSteps,
        sessionId: sessionId // Important: Save this to send to Party B
      });

      // Optionally send email/SMS to Party B with sessionId
      sendNotificationToPartyB(sessionId, data.caseId);

      // Clear local storage
      localStorage.removeItem('sessionId');
    }
  } catch (error) {
    console.error('Error submitting case:', error);
  }
};
```

**Response:**
```json
{
  "success": true,
  "caseId": "CASE-2025-123456",
  "message": "Case submitted successfully",
  "submitterType": "party_a",
  "estimatedProcessingTime": "2-3 business days",
  "nextSteps": "You will receive a confirmation email within 24 hours",
  "trackingUrl": "/case/CASE-2025-123456/status"
}
```

---

## Party B Flow (Respondent)

### UI Component: Party B Entry Modal

**When:** User visits `/submit-case` page

Show a modal or banner asking:

```
┌─────────────────────────────────────────────────┐
│  Are you responding to an existing case?        │
│                                                  │
│  [Yes, I have a Session ID]  [No, Start New]   │
└─────────────────────────────────────────────────┘
```

### If "Yes" - Show Session ID Input

```jsx
// React Example
const PartyBEntryModal = () => {
  const [showModal, setShowModal] = useState(true);
  const [sessionId, setSessionId] = useState('');
  const [error, setError] = useState('');

  const handleJoinCase = async () => {
    if (!sessionId) {
      setError('Please enter a valid Session ID');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/case-submission/join-case', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}` // Optional
        },
        body: JSON.stringify({
          parentSessionId: sessionId,
          userId: loggedInUserId // Optional
        })
      });

      const data = await response.json();

      if (data.success) {
        // Store Party B's new sessionId
        localStorage.setItem('sessionId', data.sessionId);
        localStorage.setItem('isPartyB', 'true');
        localStorage.setItem('parentSessionId', sessionId);

        // Close modal and start Party B's submission
        setShowModal(false);
        navigateToStep(1);
      } else {
        setError(data.message || 'Invalid Session ID');
      }
    } catch (error) {
      console.error('Error joining case:', error);
      setError('Failed to join case. Please check the Session ID.');
    }
  };

  return (
    <div className="modal">
      <h2>Join Existing Case</h2>
      <p>Enter the Session ID you received via email or SMS:</p>

      <input
        type="text"
        placeholder="e.g., 550e8400-e29b-41d4-a716-446655440000"
        value={sessionId}
        onChange={(e) => setSessionId(e.target.value)}
      />

      {error && <p className="error">{error}</p>}

      <button onClick={handleJoinCase}>Join Case</button>
      <button onClick={() => setShowModal(false)}>Cancel</button>
    </div>
  );
};
```

**API Response:**
```json
{
  "success": true,
  "sessionId": "660e8400-e29b-41d4-a716-446655440111",
  "message": "Successfully joined the case as Party B",
  "parentSessionId": "550e8400-e29b-41d4-a716-446655440000",
  "startedAt": "2025-01-15T14:30:00.000Z"
}
```

### Party B Submission Flow

**After joining, Party B follows the EXACT same steps 1-6 as Party A:**

- Same API endpoints (`/step1`, `/step2`, etc.)
- Same data structure
- Uses their own `sessionId` (received from join-case)
- Complete privacy - cannot see Party A's data

```javascript
// Party B submits steps the same way as Party A
const isPartyB = localStorage.getItem('isPartyB') === 'true';

// Use the same submit functions, they work for both parties
submitStep1(formData);
submitStep2(formData);
// ... etc
```

### Final Submission (Party B)

```javascript
const finalSubmit = async () => {
  const sessionId = localStorage.getItem('sessionId');
  const isPartyB = localStorage.getItem('isPartyB') === 'true';

  const response = await fetch('http://localhost:5000/api/case-submission/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`
    },
    body: JSON.stringify({
      sessionId: sessionId,
      submittedAt: new Date().toISOString(),
      submitterUserId: loggedInUserId
    })
  });

  const data = await response.json();

  if (data.success) {
    // Party B gets different response
    console.log('Response submitted:', data.caseId);
    console.log('Submitter type:', data.submitterType); // "party_b"

    showSuccessMessage({
      message: data.message,
      caseId: data.caseId,
      nextSteps: data.nextSteps
    });

    // Clear local storage
    localStorage.removeItem('sessionId');
    localStorage.removeItem('isPartyB');
    localStorage.removeItem('parentSessionId');
  }
};
```

**Party B Response:**
```json
{
  "success": true,
  "message": "Your response has been submitted successfully",
  "caseId": "CASE-2025-123456",
  "submitterType": "party_b",
  "estimatedProcessingTime": "2-3 business days",
  "nextSteps": "An admin will review both parties' submissions and contact you"
}
```

---

## Admin Dashboard Integration

### Get Full Case Details with Both Parties

```javascript
const getFullCaseDetails = async (caseId) => {
  try {
    const response = await fetch(`http://localhost:5000/api/cases/${caseId}/full-details`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}` // Admin token required
      }
    });

    const result = await response.json();

    if (result.status === 'success') {
      const { case: caseInfo, partyA, partyB, hasPartyBResponse } = result.data;

      console.log('Case:', caseInfo);
      console.log('Party A Data:', partyA);
      console.log('Party B Data:', partyB); // null if Party B hasn't submitted
      console.log('Has Party B Response:', hasPartyBResponse);

      // Render UI with both parties' data
      renderCaseComparison(partyA, partyB);
    }
  } catch (error) {
    console.error('Error fetching case details:', error);
  }
};
```

**Response Structure:**
```json
{
  "status": "success",
  "data": {
    "case": {
      "_id": "abc123",
      "title": "Marital Conflict - ...",
      "description": "...",
      "type": "family",
      "priority": "high",
      "status": "open",
      "createdBy": {...},
      "parties": [...],
      "documents": [...]
    },
    "partyA": {
      "sessionId": "550e8400-e29b-41d4-a716-446655440000",
      "status": "submitted",
      "submittedAt": "2025-01-15T10:45:00.000Z",
      "steps": {
        "step1": {
          "conflictType": "Marital Conflict",
          "description": "Party A's description...",
          "urgencyLevel": "high",
          "estimatedValue": "$50,000"
        },
        "step2": {
          "parties": [...]
        },
        "step3": {
          "timeline": "Party A's timeline...",
          "keyIssues": [...],
          "previousAttempts": "...",
          "emotionalImpact": "..."
        },
        "step4": {...},
        "step5": {...},
        "step6": {...}
      },
      "documents": [
        {
          "fileName": "marriage_certificate.pdf",
          "fileSize": 245678,
          "fileType": "application/pdf",
          "uploadUrl": "https://s3.amazonaws.com/...",
          "description": "Marriage certificate",
          "uploadedAt": "2025-01-15T10:40:00.000Z"
        }
      ]
    },
    "partyB": {
      "sessionId": "660e8400-e29b-41d4-a716-446655440111",
      "status": "submitted",
      "submittedAt": "2025-01-16T14:30:00.000Z",
      "steps": {
        "step1": {
          "conflictType": "Marital Conflict",
          "description": "Party B's description...",
          "urgencyLevel": "medium",
          "estimatedValue": "$30,000"
        },
        "step2": {...},
        "step3": {
          "timeline": "Party B's timeline...",
          "keyIssues": [...],
          "previousAttempts": "...",
          "emotionalImpact": "..."
        },
        "step4": {...},
        "step5": {...},
        "step6": {...}
      },
      "documents": [
        {
          "fileName": "financial_records.pdf",
          "fileSize": 512345,
          "fileType": "application/pdf",
          "uploadUrl": "https://s3.amazonaws.com/...",
          "description": "Bank statements",
          "uploadedAt": "2025-01-16T14:25:00.000Z"
        }
      ]
    },
    "hasPartyBResponse": true
  }
}
```

### Admin UI Component Example

```jsx
const CaseComparisonView = ({ caseId }) => {
  const [caseData, setCaseData] = useState(null);
  const [activeTab, setActiveTab] = useState('partyA');

  useEffect(() => {
    fetchFullCaseDetails(caseId);
  }, [caseId]);

  const fetchFullCaseDetails = async (id) => {
    const response = await fetch(`http://localhost:5000/api/cases/${id}/full-details`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const result = await response.json();
    setCaseData(result.data);
  };

  if (!caseData) return <div>Loading...</div>;

  return (
    <div className="case-comparison">
      <h1>Case: {caseData.case.title}</h1>
      <p>Case ID: {caseData.case._id}</p>
      <p>Status: {caseData.case.status}</p>

      {/* Tab Navigation */}
      <div className="tabs">
        <button
          className={activeTab === 'partyA' ? 'active' : ''}
          onClick={() => setActiveTab('partyA')}
        >
          Party A Submission
        </button>

        {caseData.hasPartyBResponse && (
          <button
            className={activeTab === 'partyB' ? 'active' : ''}
            onClick={() => setActiveTab('partyB')}
          >
            Party B Submission
          </button>
        )}

        <button
          className={activeTab === 'comparison' ? 'active' : ''}
          onClick={() => setActiveTab('comparison')}
          disabled={!caseData.hasPartyBResponse}
        >
          Side-by-Side Comparison
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'partyA' && (
        <PartySubmissionView data={caseData.partyA} party="A" />
      )}

      {activeTab === 'partyB' && caseData.partyB && (
        <PartySubmissionView data={caseData.partyB} party="B" />
      )}

      {activeTab === 'comparison' && caseData.hasPartyBResponse && (
        <ComparisonView partyA={caseData.partyA} partyB={caseData.partyB} />
      )}

      {!caseData.hasPartyBResponse && (
        <div className="no-party-b">
          <p>⚠️ Party B has not yet submitted their response</p>
        </div>
      )}
    </div>
  );
};

const PartySubmissionView = ({ data, party }) => {
  return (
    <div className="party-submission">
      <h2>Party {party}'s Submission</h2>
      <p>Submitted: {new Date(data.submittedAt).toLocaleString()}</p>

      <section>
        <h3>Step 1: Case Overview</h3>
        <p><strong>Conflict Type:</strong> {data.steps.step1.conflictType}</p>
        <p><strong>Description:</strong> {data.steps.step1.description}</p>
        <p><strong>Urgency:</strong> {data.steps.step1.urgencyLevel}</p>
      </section>

      <section>
        <h3>Step 2: Parties Involved</h3>
        {data.steps.step2.parties.map((party, idx) => (
          <div key={idx}>
            <p><strong>Name:</strong> {party.name}</p>
            <p><strong>Role:</strong> {party.role}</p>
            <p><strong>Email:</strong> {party.email}</p>
          </div>
        ))}
      </section>

      <section>
        <h3>Step 3: Conflict Background</h3>
        <p><strong>Timeline:</strong> {data.steps.step3.timeline}</p>
        <p><strong>Key Issues:</strong></p>
        <ul>
          {data.steps.step3.keyIssues.map((issue, idx) => (
            <li key={idx}>{issue}</li>
          ))}
        </ul>
      </section>

      {/* Continue for steps 4, 5, 6 */}

      <section>
        <h3>Uploaded Documents</h3>
        {data.documents.map((doc, idx) => (
          <div key={idx}>
            <a href={doc.uploadUrl} target="_blank" rel="noopener noreferrer">
              {doc.fileName}
            </a>
            <p>{doc.description}</p>
          </div>
        ))}
      </section>
    </div>
  );
};

const ComparisonView = ({ partyA, partyB }) => {
  return (
    <div className="side-by-side">
      <div className="column">
        <h3>Party A's Perspective</h3>
        <div>
          <strong>Description:</strong>
          <p>{partyA.steps.step1.description}</p>
        </div>
        <div>
          <strong>Key Issues:</strong>
          <ul>
            {partyA.steps.step3.keyIssues.map((issue, idx) => (
              <li key={idx}>{issue}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="column">
        <h3>Party B's Perspective</h3>
        <div>
          <strong>Description:</strong>
          <p>{partyB.steps.step1.description}</p>
        </div>
        <div>
          <strong>Key Issues:</strong>
          <ul>
            {partyB.steps.step3.keyIssues.map((issue, idx) => (
              <li key={idx}>{issue}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
```

---

## UI/UX Components

### 1. Entry Point UI Flow

```
User visits /submit-case
         |
         v
┌─────────────────────────────┐
│  "Are you responding to     │
│   an existing case?"        │
│                             │
│  [Yes] ──────→ Show Session │
│                ID Input     │
│                             │
│  [No] ───────→ Create New   │
│                Session      │
└─────────────────────────────┘
```

### 2. Session ID Input Component

```html
<div class="session-id-input">
  <h2>Join Existing Case</h2>
  <p>Enter the Session ID you received:</p>

  <input
    type="text"
    placeholder="550e8400-e29b-41d4-a716-446655440000"
    pattern="[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}"
  />

  <button>Join Case</button>

  <p class="help-text">
    Don't have a Session ID?
    <a href="#start-new">Start a new case instead</a>
  </p>
</div>
```

### 3. Progress Indicator

Show which party is submitting:

```html
<div class="submission-header">
  <span class="badge party-a">Party A - Original Submitter</span>
  <!-- OR -->
  <span class="badge party-b">Party B - Respondent</span>

  <div class="progress">
    Step <span class="current">3</span> of 6
  </div>
</div>
```

### 4. Success Message (Party A)

```html
<div class="success-message">
  <h2>✅ Case Submitted Successfully!</h2>

  <div class="case-info">
    <p><strong>Case ID:</strong> CASE-2025-123456</p>
    <p><strong>Session ID:</strong> 550e8400-e29b-41d4-a716-446655440000</p>
  </div>

  <div class="next-steps">
    <h3>Next Steps:</h3>
    <p>You will receive a confirmation email within 24 hours</p>

    <div class="party-b-notification">
      <h4>Notify the Other Party</h4>
      <p>Send them this Session ID to submit their side:</p>
      <code class="session-id-copy">550e8400-e29b-41d4-a716-446655440000</code>
      <button onclick="copySessionId()">Copy Session ID</button>
    </div>
  </div>
</div>
```

### 5. Success Message (Party B)

```html
<div class="success-message">
  <h2>✅ Response Submitted Successfully!</h2>

  <div class="case-info">
    <p><strong>Case ID:</strong> CASE-2025-123456</p>
    <p>Your response has been recorded for case CASE-2025-123456</p>
  </div>

  <div class="next-steps">
    <h3>What Happens Next:</h3>
    <p>An admin will review both parties' submissions and contact you within 2-3 business days</p>
  </div>
</div>
```

---

## Error Handling

### Common Errors and Solutions

#### 1. Invalid Session ID (Party B)

```json
{
  "success": false,
  "error": "SESSION_NOT_FOUND",
  "message": "The case session you are trying to join does not exist"
}
```

**UI Response:**
```javascript
if (data.error === 'SESSION_NOT_FOUND') {
  showError('Invalid Session ID. Please check and try again.');
}
```

#### 2. Case Not Yet Submitted (Party B)

```json
{
  "success": false,
  "error": "CASE_NOT_SUBMITTED",
  "message": "The case must be submitted before Party B can join"
}
```

**UI Response:**
```javascript
if (data.error === 'CASE_NOT_SUBMITTED') {
  showError('This case is still being prepared. Please wait for Party A to complete their submission.');
}
```

#### 3. Party B Already Joined

```json
{
  "success": false,
  "error": "PARTY_B_ALREADY_JOINED",
  "message": "Party B has already joined this case",
  "existingSessionId": "660e8400-e29b-41d4-a716-446655440111"
}
```

**UI Response:**
```javascript
if (data.error === 'PARTY_B_ALREADY_JOINED') {
  showError('Someone has already responded to this case.');
  // Optionally: if user has the existingSessionId, let them continue
}
```

#### 4. Incomplete Submission

```json
{
  "success": false,
  "error": "INCOMPLETE_SUBMISSION",
  "message": "All steps must be completed before submission"
}
```

**UI Response:**
```javascript
if (data.error === 'INCOMPLETE_SUBMISSION') {
  showError('Please complete all 6 steps before submitting.');
  highlightIncompleteSteps();
}
```

#### 5. File Upload Errors

```json
{
  "success": false,
  "error": "FILE_UPLOAD_ERROR",
  "message": "File size too large. Maximum 10MB per file."
}
```

**UI Response:**
```javascript
if (data.error === 'FILE_UPLOAD_ERROR') {
  showError(data.message);
  // Remove problematic files from upload queue
}
```

---

## Testing Scenarios

### Scenario 1: Complete Party A Flow

1. Visit `/submit-case`
2. Click "Start New Case"
3. Complete Steps 1-6
4. Click "Submit Case"
5. Verify `caseId` received
6. Save `sessionId` for Party B

### Scenario 2: Complete Party B Flow

1. Visit `/submit-case`
2. Click "Responding to Existing Case"
3. Enter Party A's `sessionId`
4. Verify new `sessionId` received for Party B
5. Complete Steps 1-6 (different data than Party A)
6. Click "Submit Response"
7. Verify success message

### Scenario 3: Admin View

1. Login as admin
2. Navigate to case details page
3. Call `/cases/:id/full-details`
4. Verify both Party A and Party B data displayed
5. Test side-by-side comparison view

### Scenario 4: Error Cases

**Test Invalid Session ID:**
```javascript
// Enter non-existent sessionId
joinCase('00000000-0000-0000-0000-000000000000')
// Should show: "SESSION_NOT_FOUND"
```

**Test Duplicate Party B:**
```javascript
// Try to join same case twice with different users
joinCase(sameSessionId)
// Second attempt should show: "PARTY_B_ALREADY_JOINED"
```

**Test Incomplete Submission:**
```javascript
// Skip some steps, try to submit
submitCase()
// Should show: "INCOMPLETE_SUBMISSION"
```

---

## Sample Notification Templates

### Email to Party B (Sent by Party A or Admin)

```
Subject: You've Been Invited to Respond to a Case Submission

Dear [Party B Name],

A case has been registered on our Conflict Management Platform that involves you.
We invite you to submit your side of the story.

Case Details:
- Case ID: CASE-2025-123456
- Case Type: Marital Conflict
- Submitted By: [Party A Name]
- Date: January 15, 2025

To submit your response:
1. Visit: https://yourplatform.com/submit-case
2. Click "Responding to Existing Case"
3. Enter this Session ID: 550e8400-e29b-41d4-a716-446655440000

Please complete your submission within 7 days.

If you have any questions, contact our support team.

Best regards,
Conflict Management Team
```

### SMS to Party B

```
You've been invited to respond to case CASE-2025-123456.
Visit https://yourplatform.com/submit-case and use Session ID:
550e8400-e29b-41d4-a716-446655440000
```

---

## State Management Recommendation

### LocalStorage Keys

```javascript
// Store these keys during submission process
const STORAGE_KEYS = {
  SESSION_ID: 'sessionId',           // Current session ID
  IS_PARTY_B: 'isPartyB',            // Boolean flag
  PARENT_SESSION_ID: 'parentSessionId', // Party A's session (only for Party B)
  CURRENT_STEP: 'currentStep',       // Track progress
  FORM_DATA: 'formData'              // Save draft data
};

// Helper functions
const saveToStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const getFromStorage = (key) => {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : null;
};

const clearSubmissionData = () => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
};
```

### React State Example

```javascript
const useSubmissionState = () => {
  const [sessionId, setSessionId] = useState(() =>
    getFromStorage(STORAGE_KEYS.SESSION_ID)
  );
  const [isPartyB, setIsPartyB] = useState(() =>
    getFromStorage(STORAGE_KEYS.IS_PARTY_B) || false
  );
  const [currentStep, setCurrentStep] = useState(() =>
    getFromStorage(STORAGE_KEYS.CURRENT_STEP) || 1
  );

  // Persist to localStorage when state changes
  useEffect(() => {
    if (sessionId) saveToStorage(STORAGE_KEYS.SESSION_ID, sessionId);
  }, [sessionId]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.IS_PARTY_B, isPartyB);
  }, [isPartyB]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.CURRENT_STEP, currentStep);
  }, [currentStep]);

  return {
    sessionId,
    setSessionId,
    isPartyB,
    setIsPartyB,
    currentStep,
    setCurrentStep
  };
};
```

---

## API Response Summary

### Success Responses

| Endpoint | Success Code | Response |
|----------|--------------|----------|
| Create Session | 201 | `{ success: true, sessionId: "...", message: "..." }` |
| Join Case | 201 | `{ success: true, sessionId: "...", parentSessionId: "..." }` |
| Submit Step | 200 | `{ success: true, message: "...", nextStep: 2 }` |
| Final Submit (A) | 200 | `{ success: true, caseId: "...", submitterType: "party_a" }` |
| Final Submit (B) | 200 | `{ success: true, caseId: "...", submitterType: "party_b" }` |
| Full Details | 200 | `{ status: "success", data: { case, partyA, partyB, hasPartyBResponse } }` |

### Error Responses

| Error Code | Error Type | Meaning |
|------------|------------|---------|
| 404 | SESSION_NOT_FOUND | Invalid sessionId |
| 400 | CASE_NOT_SUBMITTED | Party A hasn't submitted yet |
| 400 | PARTY_B_ALREADY_JOINED | Party B already responded |
| 400 | INCOMPLETE_SUBMISSION | Missing steps |
| 400 | FILE_UPLOAD_ERROR | File validation failed |
| 403 | UNAUTHORIZED | Admin access required |

---

## Additional Notes

1. **Session Expiry:** Consider implementing session expiry (e.g., 30 days) and cleanup old draft sessions

2. **Auto-Save:** Implement auto-save functionality to prevent data loss:
```javascript
const autoSave = debounce((stepData) => {
  saveToStorage(STORAGE_KEYS.FORM_DATA, stepData);
}, 2000);
```

3. **Validation:** Always validate on both frontend and backend. Use the same validation rules as defined in `validators.js`

4. **File Size Limits:**
   - Max file size: 10MB per file
   - Max files: 5 files per submission
   - Allowed types: PDF, DOC, DOCX, JPG, PNG, TXT

5. **Mobile Responsiveness:** Ensure the Session ID input works well on mobile devices with proper keyboard type

6. **Analytics:** Track key events:
   - Session created
   - Party B joined
   - Step completed
   - Case submitted

---

## Quick Start Checklist

### For Party A Implementation:
- [ ] Create session endpoint integration
- [ ] Build 6-step form wizard
- [ ] Implement file upload (Step 6)
- [ ] Add final submission flow
- [ ] Display success message with sessionId
- [ ] Add notification mechanism for Party B

### For Party B Implementation:
- [ ] Add "Join Case" modal/banner
- [ ] Session ID input with validation
- [ ] Join case endpoint integration
- [ ] Reuse same 6-step form (no changes needed)
- [ ] Display Party B success message
- [ ] Handle error states

### For Admin Dashboard:
- [ ] Create case list view
- [ ] Add "View Full Details" button
- [ ] Build Party A/Party B tabs
- [ ] Implement side-by-side comparison view
- [ ] Show Party B status indicator
- [ ] Add document download functionality

---

## Support

For questions or issues with implementation, contact the backend team or refer to:
- API Documentation: `/api-docs` (Swagger)
- Backend Repository: [Link to repo]
- CLAUDE.md: Project guidelines

---

**Last Updated:** January 2025
**Version:** 1.0.0
