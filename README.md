# Electoral Command

A secure, high-tech voting platform built for university elections. This system was designed to be tamper-proof, sleek, and easy for both administrators and voters to use.

## Core Tech
*   **Frontend:** React + Vite + Tailwind CSS
*   **Backend/DB:** Supabase (PostgreSQL)
*   **Icons:** Lucide React
*   **State Management:** React Query

## Key Security Features
We didn't just build a voting app; we built a secure one.
*   **Invisible Identity:** Voter IDs are never exposed in the URL. We use session-based handshakes to prevent link sharing and identity theft.
*   **Email Guard:** Strict domain checking ensures only authorized university emails (@kab.ac.ug) can access the ballot.
*   **One Device, One Vote:** Integrated local storage locks prevent the same device from being used for multiple votes.
*   **Row Level Security (RLS):** The database itself blocks anyone from editing or deleting votes once they are cast.

## Setup Instructions
1.  **Install dependencies:**
    ```bash
    npm install
    ```
2.  **Environment Variables:**
    Create a `.env` file and add your Supabase credentials:
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_anon_key
    ```
3.  **Run locally:**
    ```bash
    npm run dev
    ```

## Admin Workflow
1.  **Create Election:** Set the title, description, and timeframe.
2.  **Add Positions:** Define roles (e.g., President, Chairperson).
3.  **Add Candidates:** Upload photos and manifestos for each candidate.
4.  **Publish:** Generate a secure sharing link for voters.
5.  **Results:** Monitor real-time stats and export verified voter lists as CSV.

## Deployment (Vercel)
The project includes a `vercel.json` file to handle SPA routing. When deploying, make sure to add your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to the Vercel Environment Variables.

---
Built for secure, transparent, and modern elections.
