# RAMEX

Act as an expert UX/UI Designer and Full-Stack Developer. Please build a modern, corporate-style React web application using Tailwind CSS, Shadcn UI, and Recharts. The application is an "AI Initiative Evaluation & Decision-Support System" for the retail industry.

The app should have 3 main functional areas:

1. Dynamic Weight Configuration (Settings)

2. Input Form Page (MCDM Assessment)

3. Results Dashboard Page (Decision Output)

---

### 1. DYNAMIC WEIGHT CONFIGURATION (MCDM Weights)

At the top of the form or in a sticky sidebar, add a "Criteria Weighting" section. 

Allow the user to adjust the importance of the 4 dimensions using percentage inputs or sliders.

* Dimension 1: Business Value (Default 25%)

* Dimension 2: Data Readiness (Default 25%)

* Dimension 3: Technical Feasibility (Default 25%)

* Dimension 4: Organizational & Governance (Default 25%)

* **UX/UI Requirement:** The total MUST always sum up to exactly 100%. Show a real-time Total counter. If the total is not 100%, show a clear validation error in Red and disable the "Calculate/Submit" button.

---

### 2. INPUT FORM PAGE (MCDM Assessment)

Design a clean, step-by-step form (or a well-categorized single page using Accordions/Cards) to collect data across 4 dimensions. 

For 1-5 scales, use intuitive sliders or rating components (1 = Low/Critical, 5 = Optimal/High). For Yes/No, use Toggle Switches.

**Dimension 1: Business Value**

* Financial Impact (Scale 1-5)

* Operational Efficiency (Scale 1-5)

* Customer & Brand Value (Scale 1-5)

**Dimension 2: Data Readiness**

* Data Availability (Binary Toggle: Yes/No) - *Crucial Field*

* Quality & Accessibility (Scale 1-5)

* Integration Feasibility (Scale 1-5)

**Dimension 3: Technical Feasibility**

* Model Performance & Uptime (Scale 1-5)

* Scalability & Interoperability (Scale 1-5)

* Cloud FinOps & Total Cost of Ownership (Scale 1-5)

**Dimension 4: Organizational & Governance Readiness**

* User Readiness & Change Capability (Scale 1-5)

* Leadership & Vendor Support (Scale 1-5)

* Governance, Privacy & Legal Gate (Binary Toggle: Yes/No) - *Crucial Field*

* Human-in-the-Loop Oversight (Scale 1-5)

---

### 3. LOGIC & CALCULATION ENGINE (SAW Method)

Implement "Simple Additive Weighting (SAW)" logic to calculate the Composite Score (out of 5.0).

* Calculate the average score for each dimension first.

* Then multiply each dimension's average by its respective user-defined weight (from the Weight Configuration section) and sum them up to get the Final Composite Score.

**Risk Gate Logic (Crucial for UI state):**

* HARD GATE: If "Data Availability" = NO, or "Governance & Legal Gate" = NO, the system must immediately flag the initiative as "REJECTED / HIGH RISK" regardless of the score.

* SOFT GATE: If any 1-5 scale field scores a '1' or '2', trigger a specific warning (e.g., Score < 3 in Quality = "Data Prep Warning").

---

### 4. RESULTS DASHBOARD PAGE (Decision Output)

Once the form is submitted, show a highly visual dashboard for decision-makers:

* **Top Section (Status & Score):** A large composite score (e.g., 4.2 / 5.0) and a bold Status Badge (Top Priority, Conditional, or REJECTED based on Risk Gates).

* **Applied Weights Display:** Briefly show the weights used for this calculation (e.g., "Weights applied: Bus: 40%, Data: 20%, Tech: 20%, Org: 20%").

* **Visual Chart:** A Radar Chart (Spider Web chart using Recharts) mapping the average scores of the 4 dimensions to visualize strengths and weaknesses.

* **Risk Alerts Panel:** A dedicated red/yellow warning box listing triggered Hard Gates or Soft Gates.

* **Action Buttons:** "Export to PDF" and "Evaluate Another Initiative".

---

### UI/UX Guidelines:

* Color Palette: Professional corporate (Navy blue, Slate gray, with clear Red/Yellow/Green for status indicators).

* Typography: Clean sans-serif (Inter or Roboto).

* Ensure the layout is responsive and prioritizing readability for C-level executives.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/3bb5f850-b996-4ff3-922c-770e45e0ea59).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
