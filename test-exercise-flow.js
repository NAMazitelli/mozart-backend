// Test complete exercise flow
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testExerciseFlow() {
  console.log('🎵 Testing Complete Exercise Flow...\n');

  try {
    // 1. Register a user
    const timestamp = Date.now();
    const registerData = {
      email: `flow${timestamp}@example.com`,
      password: 'password123',
      username: `flowuser${timestamp}`,
      fullName: 'Flow Test User'
    };

    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, registerData);
    console.log('1. ✅ User registration:', registerResponse.status === 201 ? 'SUCCESS' : 'FAILED');

    if (registerResponse.status !== 201) return;

    const token = registerResponse.data.token;
    const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

    // 2. Get an exercise
    console.log('\n2. Getting an exercise...');
    const exerciseResponse = await axios.get(`${BASE_URL}/exercise/guess-note/easy`, authHeaders);
    console.log('✅ Exercise generation:', exerciseResponse.status === 200 ? 'SUCCESS' : 'FAILED');

    if (exerciseResponse.status !== 200) return;

    const exercise = exerciseResponse.data;
    console.log('   Exercise details:', {
      id: exercise.id,
      type: exercise.type,
      difficulty: exercise.difficulty,
      points: exercise.points,
      optionsCount: exercise.options?.length
    });

    // 3. Submit exercise attempt (simulate correct answer)
    console.log('\n3. Submitting exercise attempt...');
    const submissionData = {
      exerciseCategory: exercise.category,
      difficulty: exercise.difficulty,
      isCorrect: true,
      userAnswer: exercise.correctAnswerIndex,
      correctAnswer: exercise.correctAnswerIndex,
      accuracy: 100,
      timeTaken: 5,
      exerciseData: {
        exerciseId: exercise.id,
        selectedAnswerIndex: exercise.correctAnswerIndex,
        correctNote: exercise.correctNote
      }
    };

    const submissionResponse = await axios.post(`${BASE_URL}/exercise/submit`, submissionData, authHeaders);
    console.log('✅ Exercise submission:', submissionResponse.status === 200 ? 'SUCCESS' : 'FAILED');

    if (submissionResponse.status === 200) {
      console.log('   Submission results:', {
        pointsEarned: submissionResponse.data.pointsEarned,
        isCorrect: submissionResponse.data.isCorrect,
        userStats: submissionResponse.data.userStats
      });
    }

    // 4. Check updated user scores
    console.log('\n4. Checking updated user scores...');
    const scoresResponse = await axios.get(`${BASE_URL}/user/scores`, authHeaders);
    console.log('✅ Updated scores fetch:', scoresResponse.status === 200 ? 'SUCCESS' : 'FAILED');
    console.log('   Scores count:', scoresResponse.data?.length || 0);
    if (scoresResponse.data?.length > 0) {
      console.log('   Latest score:', scoresResponse.data[0]);
    }

    // 5. Check user profile for updated stats
    console.log('\n5. Checking updated user profile...');
    const profileResponse = await axios.get(`${BASE_URL}/user/profile`, authHeaders);
    console.log('✅ Updated profile fetch:', profileResponse.status === 200 ? 'SUCCESS' : 'FAILED');
    if (profileResponse.status === 200) {
      const profile = profileResponse.data;
      console.log('   Updated stats:', {
        totalScore: profile.totalScore,
        currentStreak: profile.currentStreak,
        totalExercisesCompleted: profile.totalExercisesCompleted
      });
    }

    // 6. Submit a few more exercises to test leaderboard
    console.log('\n6. Testing multiple exercise submissions...');
    for (let i = 0; i < 3; i++) {
      const nextExercise = await axios.get(`${BASE_URL}/exercise/intervals/medium`, authHeaders);
      if (nextExercise.status === 200) {
        const nextSubmission = {
          exerciseCategory: 'intervals',
          difficulty: 'medium',
          isCorrect: i < 2, // Make first 2 correct, last one incorrect
          userAnswer: [1, 2, 3],
          correctAnswer: [1, 2, 3],
          accuracy: i < 2 ? 100 : 60,
          timeTaken: 8,
          exerciseData: { exerciseId: nextExercise.data.id }
        };
        await axios.post(`${BASE_URL}/exercise/submit`, nextSubmission, authHeaders);
      }
    }
    console.log('✅ Multiple submissions completed');

    // 7. Test leaderboard with data
    console.log('\n7. Testing leaderboard with real data...');
    const leaderboardResponse = await axios.get(`${BASE_URL}/user/leaderboard/global`, authHeaders);
    console.log('✅ Global leaderboard:', leaderboardResponse.status === 200 ? 'SUCCESS' : 'FAILED');
    console.log('   Leaderboard entries:', leaderboardResponse.data?.length || 0);

    // 8. Final scores check
    console.log('\n8. Final scores check...');
    const finalScoresResponse = await axios.get(`${BASE_URL}/user/scores`, authHeaders);
    console.log('✅ Final scores:', finalScoresResponse.status === 200 ? 'SUCCESS' : 'FAILED');
    console.log('   Total score categories:', finalScoresResponse.data?.length || 0);

    console.log('\n🎉 Exercise flow test completed successfully!');

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Server is not running. Please start the server first.');
    } else if (error.response) {
      console.log(`❌ API Error: ${error.response.status} - ${error.response.data?.error || error.response.statusText}`);
      if (error.response.data) {
        console.log('   Response data:', error.response.data);
      }
    } else {
      console.log('❌ Test error:', error.message);
    }
  }
}

testExerciseFlow();