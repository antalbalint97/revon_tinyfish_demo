# Backend Orchestration

The backend orchestration logic handles the execution flow of sourcing runs, managing the interaction between the user input and the TinyFish automation layer.

The core of the orchestration logic is located in `apps/api/src/orchestrators/discoveryRun.ts`.

## Orchestration Stages

### 1. Directory Discovery Stage
The backend submits an asynchronous task to TinyFish to find candidate companies in a target directory (e.g., LinkedIn, Clutch, etc.).

### 2. Candidate Extraction
Once the directory discovery is complete, the backend parses the results to extract potential leads, including company names and website URLs.

### 3. Inspection Stage
The backend then launches parallel website inspections for each candidate. TinyFish agents visit each company's website to extract structured data (e.g., summary, services, team members, contact info).

### 4. Async Execution Model
The backend uses an asynchronous model to manage multiple concurrent TinyFish runs. This allows the system to scale and handle long-running automation tasks without blocking the main API thread.

### 5. Polling Loop
The orchestration logic includes a polling loop that periodically checks the status of active TinyFish runs until they reach a terminal state (COMPLETED, FAILED, or CANCELLED).

### 6. Result Aggregation
After all inspections are finished, the backend aggregates the results, scores the leads based on the user's Ideal Customer Profile (ICP), and prepares a final report.

### 7. Session Storage
The entire run's progress, logs, and results are persisted in a session store, allowing the frontend to provide real-time updates and historical analysis.

## Reference
- `apps/api/src/orchestrators/discoveryRun.ts`
