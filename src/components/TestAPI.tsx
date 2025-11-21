// src/components/TestAPI.tsx
import { jobAPI } from "../services/api";

export function TestAPI() {
  const testJobs = async () => {
    try {
      const result = await jobAPI.getAll({ limit: 5 });
      alert(`✅ Success! Got ${result.results} jobs`);
      console.log(result.data.jobs); // Access the actual jobs array
    } catch (err: any) {
      alert(`❌ Error: ${err.message}`);
    }
  };

  return (
    <div style={{ padding: "20px", background: "lightblue" }}>
      <h2>🧪 Test API</h2>
      <button onClick={testJobs} style={{ padding: "10px", fontSize: "16px" }}>
        Test jobAPI.getAll()
      </button>
    </div>
  );
}
