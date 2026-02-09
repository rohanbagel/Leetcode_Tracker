import { supabaseAdmin } from "@/lib/supabase";

// LeetCode GraphQL endpoint
const LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql";

// GraphQL query to get user profile stats including acceptance rate
const USER_PROFILE_QUERY = `
  query getUserProfile($username: String!) {
    matchedUser(username: $username) {
      username
      submitStats: submitStatsGlobal {
        acSubmissionNum {
          difficulty
          count
          submissions
        }
        totalSubmissionNum {
          difficulty
          count
          submissions
        }
      }
      profile {
        ranking
        reputation
      }
    }
    allQuestionsCount {
      difficulty
      count
    }
  }
`;

// GraphQL query to get recent AC submissions
const RECENT_SUBMISSIONS_QUERY = `
  query getRecentAcSubmissions($username: String!, $limit: Int!) {
    recentAcSubmissionList(username: $username, limit: $limit) {
      id
      title
      titleSlug
      timestamp
    }
  }
`;

// Fetch recent AC submissions from LeetCode GraphQL
async function fetchRecentSubmissions(username, limit = 20) {
  try {
    const response = await fetch(LEETCODE_GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Referer": "https://leetcode.com",
      },
      body: JSON.stringify({
        query: RECENT_SUBMISSIONS_QUERY,
        variables: { username, limit },
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`GraphQL request failed: ${response.status}`);
    }

    const data = await response.json();

    if (data.errors || !data.data?.recentAcSubmissionList) {
      console.error("Recent submissions error:", data.errors);
      return [];
    }

    return data.data.recentAcSubmissionList.map((item) => ({
      title: item.title,
      titleSlug: item.titleSlug,
      timestamp: parseInt(item.timestamp),
    }));
  } catch (error) {
    console.error("Failed to fetch recent submissions:", error.message);
    return [];
  }
}

// Fetch from LeetCode's official GraphQL API
async function fetchFromLeetCodeGraphQL(username) {
  try {
    const response = await fetch(LEETCODE_GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Referer": "https://leetcode.com",
      },
      body: JSON.stringify({
        query: USER_PROFILE_QUERY,
        variables: { username },
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`GraphQL request failed: ${response.status}`);
    }

    const data = await response.json();

    if (data.errors || !data.data?.matchedUser) {
      throw new Error("User not found or GraphQL error");
    }

    const user = data.data.matchedUser;
    const allQuestions = data.data.allQuestionsCount;
    const acSubmissionNum = user.submitStats.acSubmissionNum;
    const totalSubmissionNum = user.submitStats.totalSubmissionNum;

    // Parse submission stats
    const stats = {
      easy: { solved: 0, total: 0 },
      medium: { solved: 0, total: 0 },
      hard: { solved: 0, total: 0 },
      all: { solved: 0, total: 0 },
    };

    // Track total submissions for acceptance rate
    let totalAccepted = 0;
    let totalSubmissions = 0;

    acSubmissionNum.forEach((item) => {
      const diff = item.difficulty.toLowerCase();
      if (stats[diff] !== undefined) {
        stats[diff].solved = item.count;
      }
      if (diff === "all") {
        stats.all.solved = item.count;
        totalAccepted = item.submissions || 0;
      }
    });

    totalSubmissionNum.forEach((item) => {
      const diff = item.difficulty.toLowerCase();
      if (diff === "all") {
        totalSubmissions = item.submissions || 0;
      }
    });

    allQuestions.forEach((item) => {
      const diff = item.difficulty.toLowerCase();
      if (stats[diff] !== undefined) {
        stats[diff].total = item.count;
      }
      if (diff === "all") {
        stats.all.total = item.count;
      }
    });

    // Calculate acceptance rate
    const acceptanceRate = totalSubmissions > 0 
      ? ((totalAccepted / totalSubmissions) * 100).toFixed(2) 
      : 0;

    return {
      source: "leetcode-graphql",
      totalSolved: stats.all.solved,
      easySolved: stats.easy.solved,
      mediumSolved: stats.medium.solved,
      hardSolved: stats.hard.solved,
      totalEasy: stats.easy.total,
      totalMedium: stats.medium.total,
      totalHard: stats.hard.total,
      ranking: user.profile?.ranking || 0,
      reputation: user.profile?.reputation || 0,
      acceptanceRate: parseFloat(acceptanceRate),
      contributionPoints: 0,
    };
  } catch (error) {
    console.error("LeetCode GraphQL error:", error.message);
    throw error;
  }
}

// Fetch from third-party API (alfa-leetcode-api)
async function fetchFromAlfaAPI(username) {
  try {
    const response = await fetch(
      `https://alfa-leetcode-api.onrender.com/${username}/solved`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      throw new Error(`Alfa API failed: ${response.status}`);
    }

    const data = await response.json();

    if (data.error || !data.solvedProblem) {
      throw new Error("User not found on Alfa API");
    }

    return {
      source: "alfa-leetcode-api",
      totalSolved: data.solvedProblem || 0,
      easySolved: data.easySolved || 0,
      mediumSolved: data.mediumSolved || 0,
      hardSolved: data.hardSolved || 0,
      totalEasy: data.totalEasy || 0,
      totalMedium: data.totalMedium || 0,
      totalHard: data.totalHard || 0,
      ranking: data.ranking || 0,
      reputation: 0,
      acceptanceRate: 0,
      contributionPoints: 0,
    };
  } catch (error) {
    console.error("Alfa API error:", error.message);
    throw error;
  }
}

// Fetch from herokuapp (original API)
async function fetchFromHerokuAPI(username) {
  try {
    const response = await fetch(
      `https://leetcode-stats-api.herokuapp.com/${username}`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      throw new Error(`Heroku API failed: ${response.status}`);
    }

    const data = await response.json();

    if (data.status === "error") {
      throw new Error("User not found on Heroku API");
    }

    return {
      source: "heroku-leetcode-api",
      totalSolved: data.totalSolved || 0,
      easySolved: data.easySolved || 0,
      mediumSolved: data.mediumSolved || 0,
      hardSolved: data.hardSolved || 0,
      totalEasy: data.totalEasy || 0,
      totalMedium: data.totalMedium || 0,
      totalHard: data.totalHard || 0,
      ranking: data.ranking || 0,
      reputation: data.reputation || 0,
      acceptanceRate: data.acceptanceRate || 0,
      contributionPoints: data.contributionPoints || 0,
    };
  } catch (error) {
    console.error("Heroku API error:", error.message);
    throw error;
  }
}

// Main fetch function with fallbacks
async function fetchLeetCodeData(username) {
  const errors = [];

  // Try LeetCode GraphQL first (official API)
  try {
    console.log(`Trying LeetCode GraphQL for ${username}...`);
    const data = await fetchFromLeetCodeGraphQL(username);
    console.log(`Success: Got data from LeetCode GraphQL`);
    return data;
  } catch (error) {
    errors.push(`GraphQL: ${error.message}`);
  }

  // Fallback to Alfa API
  try {
    console.log(`Trying Alfa API for ${username}...`);
    const data = await fetchFromAlfaAPI(username);
    console.log(`Success: Got data from Alfa API`);
    return data;
  } catch (error) {
    errors.push(`Alfa: ${error.message}`);
  }

  // Fallback to Heroku API
  try {
    console.log(`Trying Heroku API for ${username}...`);
    const data = await fetchFromHerokuAPI(username);
    console.log(`Success: Got data from Heroku API`);
    return data;
  } catch (error) {
    errors.push(`Heroku: ${error.message}`);
  }

  // All APIs failed
  throw new Error(`All APIs failed: ${errors.join("; ")}`);
}

export async function GET(request) {
  try {
    // 1. Get username from query params
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");

    // 2. Validate username
    if (!username) {
      return Response.json(
        { error: "Username parameter is required" },
        { status: 400 }
      );
    }

    // Validate username format (alphanumeric, underscore, hyphen only)
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return Response.json(
        { error: "Invalid username format" },
        { status: 400 }
      );
    }

    // 3. Check Supabase connection
    if (!supabaseAdmin) {
      return Response.json(
        { error: "Database connection not configured" },
        { status: 500 }
      );
    }

    // 4. Fetch from LeetCode APIs with fallbacks
    let leetcodeData;
    try {
      leetcodeData = await fetchLeetCodeData(username);
    } catch (error) {
      return Response.json(
        { error: `Failed to fetch LeetCode data for ${username}: ${error.message}` },
        { status: 404 }
      );
    }

    // 5. Get previous snapshot
    const { data: prevSnapshot, error: fetchError } = await supabaseAdmin
      .from("leetcode_snapshot")
      .select("*")
      .eq("username", username)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      throw new Error(`Database error: ${fetchError.message}`);
    }

    // 6. Compute delta
    const prevTotalSolved = prevSnapshot?.total_solved || 0;
    const currentTotalSolved = leetcodeData.totalSolved || 0;
    const delta = currentTotalSolved - prevTotalSolved;

    // 7. Prepare snapshot data
    const snapshotData = {
      username: username,
      total_solved: currentTotalSolved,
      easy_solved: leetcodeData.easySolved || 0,
      medium_solved: leetcodeData.mediumSolved || 0,
      hard_solved: leetcodeData.hardSolved || 0,
      total_easy: leetcodeData.totalEasy || 0,
      total_medium: leetcodeData.totalMedium || 0,
      total_hard: leetcodeData.totalHard || 0,
      acceptance_rate: leetcodeData.acceptanceRate || 0,
      ranking: leetcodeData.ranking || 0,
      contribution_points: leetcodeData.contributionPoints || 0,
      reputation: leetcodeData.reputation || 0,
      last_delta: delta,
      updated_at: new Date().toISOString(),
    };

    // 8. Upsert snapshot
    const { error: upsertError } = await supabaseAdmin
      .from("leetcode_snapshot")
      .upsert(snapshotData, { onConflict: "username" });

    if (upsertError) {
      throw new Error(`Database upsert error: ${upsertError.message}`);
    }

    // 9. Log solve event if delta > 0
    if (delta > 0) {
      await supabaseAdmin.from("solve_history").insert({
        username: username,
        problems_solved: delta,
        total_at_time: currentTotalSolved,
        solved_at: new Date().toISOString(),
      });

      // Fetch recent submissions to get actual problem details
      console.log(`Fetching recent submissions for ${username} (delta: ${delta})...`);
      const recentSubmissions = await fetchRecentSubmissions(username, Math.min(delta + 5, 20));
      
      if (recentSubmissions.length > 0) {
        // Get the most recent submissions (up to delta count)
        const newSubmissions = recentSubmissions.slice(0, delta).map((sub) => ({
          username: username,
          problem_title: sub.title,
          problem_number: parseInt(sub.titleSlug.match(/\d+/) ? sub.titleSlug.match(/\d+/)[0] : 0),
          problem_slug: sub.titleSlug,
          difficulty: "", // We'll need to fetch this separately if needed
          submitted_at: new Date(sub.timestamp * 1000).toISOString(),
          synced_at: new Date().toISOString(),
        }));

        // Store the submissions
        const { error: submissionsError } = await supabaseAdmin
          .from("recent_submissions")
          .insert(newSubmissions);

        if (submissionsError) {
          console.error("Failed to store recent submissions:", submissionsError);
        } else {
          console.log(`Stored ${newSubmissions.length} recent submissions for ${username}`);
        }
      }
    }

    // 10. Store sync history (deduplicate)
    const { data: lastSync } = await supabaseAdmin
      .from("sync_history")
      .select("*")
      .eq("username", username)
      .order("synced_at", { ascending: false })
      .limit(1)
      .single();

    const statsChanged =
      !lastSync ||
      lastSync.total_solved !== currentTotalSolved ||
      lastSync.easy_solved !== leetcodeData.easySolved ||
      lastSync.medium_solved !== leetcodeData.mediumSolved ||
      lastSync.hard_solved !== leetcodeData.hardSolved ||
      lastSync.ranking !== leetcodeData.ranking;

    if (statsChanged) {
      await supabaseAdmin.from("sync_history").insert({
        username: username,
        total_solved: currentTotalSolved,
        easy_solved: leetcodeData.easySolved || 0,
        medium_solved: leetcodeData.mediumSolved || 0,
        hard_solved: leetcodeData.hardSolved || 0,
        acceptance_rate: leetcodeData.acceptanceRate || 0,
        ranking: leetcodeData.ranking || 0,
        contribution_points: leetcodeData.contributionPoints || 0,
        reputation: leetcodeData.reputation || 0,
        synced_at: new Date().toISOString(),
      });
    }

    // 11. Return success response
    return Response.json({
      success: true,
      username: username,
      totalSolved: currentTotalSolved,
      snapshot: snapshotData,
      delta: delta,
      source: leetcodeData.source,
      message: delta > 0 ? `New problems solved: ${delta}` : "Stats synced successfully",
    });
  } catch (error) {
    console.error("Sync error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
