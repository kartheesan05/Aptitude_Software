import http from "k6/http";
import { check, sleep } from "k6";

// Test configuration
export const options = {
  stages: [{ duration: "5s", target: 100 }],
  thresholds: {
    http_req_duration: ["p(95)<2000"], // 95% of requests should be below 2s
    http_req_failed: ["rate<0.01"], // Less than 1% of requests should fail
  },
};

// Environment variables with defaults
const BASE_URL = __ENV.BASE_URL || "https://api.forese.co.in/api/users";
const ACCESS_CODE = __ENV.ACCESS_CODE || "code8";

// Helper function to generate test user data
function generateTestUser(counter) {
  const num = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
  const regNum = String(Math.floor(Math.random() * 1000000)).padStart(6, "0");
  const departments = [
    "aids",
    "auto",
    "bio",
    "chem",
    "civil",
    "cs",
    "ee",
    "ec",
    "mechat",
    "mech",
    "it",
  ];
  const depid = [
    "ad",
    "au",
    "bt",
    "ch",
    "cv",
    "cs",
    "ee",
    "ec",
    "mn",
    "me",
    "it",
  ];
  const dept = departments[Math.floor(Math.random() * departments.length)];
  return {
    email: `2022${depid[departments.indexOf(dept)]}${num}@svce.ac.in`,
    regNo: `2127220${regNum}`,
    department: dept,
    accessCode: ACCESS_CODE,
    username: `TestUser${num}`,
  };
}

// Helper function to generate random answers
function generateRandomAnswers(questionCount) {
  return Array(questionCount)
    .fill(0)
    .map(() => Math.floor(Math.random() * 4));
}

export default function () {
  const user = generateTestUser(__VU); // Virtual User number as counter

  // Step 1: Check Session
  let checkSessionRes = http.post(
    `${BASE_URL}/check-session`,
    JSON.stringify(user),
    {
      headers: { "Content-Type": "application/json" },
      tags: { name: "CheckSession" },
    }
  );

  check(checkSessionRes, {
    "check-session status is 200": (r) => r.status === 200,
    "received valid token": (r) => {
      const body = JSON.parse(r.body);
      return (
        body.token &&
        typeof body.token === "string" &&
        body.token.split(".").length === 3
      );
    },
    "has correct role": (r) => JSON.parse(r.body).role === "student",
    "can take test": (r) => JSON.parse(r.body).canTakeTest === true,
  });

  if (checkSessionRes.status !== 200) {
    console.error("Failed at check-session:", checkSessionRes.body);
    return;
  }

  const token = JSON.parse(checkSessionRes.body).token;
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  //   sleep(1);

  // Step 2: Create Session
  let createSessionRes = http.post(`${BASE_URL}/create-session`, "", {
    headers: headers,
    tags: { name: "CreateSession" },
  });

  check(createSessionRes, {
    "create-session status is 200": (r) => r.status === 200,
    "received questions data": (r) => {
      const body = JSON.parse(r.body);
      return (
        body.questions &&
        body.questions.aptitude &&
        Array.isArray(body.questions.aptitude)
      );
    },
  });

  if (createSessionRes.status !== 200) {
    console.error("Failed at create-session:", createSessionRes.body);
    return;
  }

  //   sleep(1);

  // Step 3: Fetch questions for each section
  const sections = [
    "aptitude",
    "core",
    "verbal",
    "programming",
    "comprehension",
  ];
  let allQuestions = {};

  for (let section of sections) {
    let questionsRes = http.get(
      `${BASE_URL}/fetch-section?section=${section}`,
      {
        headers: headers,
        tags: { name: `FetchSection_${section}` },
      }
    );

    check(questionsRes, {
      [`fetch ${section} questions status is 200`]: (r) => r.status === 200,
      [`${section} questions are valid`]: (r) => {
        const body = JSON.parse(r.body);
        if (section === "comprehension") {
          return body.questions && body.questions.passage && body.questions.q1;
        }
        return body.questions && Array.isArray(body.questions);
      },
    });

    if (questionsRes.status !== 200) {
      console.error(`Failed at fetch-section ${section}:`, questionsRes.body);
      return;
    }

    allQuestions[section] = JSON.parse(questionsRes.body).questions;
    // sleep(1);
  }

  // Step 4: Submit test with random answers
  const answers = {
    aptitude: generateRandomAnswers(10),
    core: generateRandomAnswers(20),
    verbal: generateRandomAnswers(5),
    programming: generateRandomAnswers(10),
    comprehension: generateRandomAnswers(5),
  };

  let submitRes = http.post(
    `${BASE_URL}/submit-test`,
    JSON.stringify({ answers }),
    {
      headers: headers,
      tags: { name: "SubmitTest" },
    }
  );

  check(submitRes, {
    "submit-test status is 200": (r) => r.status === 200,
    "test submitted successfully": (r) =>
      JSON.parse(r.body).message === "Test submitted successfully",
  });

  if (submitRes.status !== 200) {
    console.error("Failed at submit-test:", submitRes.body);
  }

  //   sleep(2);
}
