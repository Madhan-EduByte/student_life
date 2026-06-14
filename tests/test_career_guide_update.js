async function test() {
    const baseUrl = 'http://localhost:8000/api/v1';
    
    // 1. Login
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'username=student@example.com&password=password123'
    });
    const tokenData = await loginRes.json();
    const token = tokenData.access_token;
    console.log("Login OK");

    // 2. Update Profile
    const profilePayload = {
        interests: ['creative'],
        strengths: ['communication'],
        industry_stream: 'creative_arts',
        education_level: 'bachelor',
        budget: 'low',
        location: 'remote',
        work_life_balance: 'standard',
        risk_tolerance: 'low',
        interaction_style: 'collaborative'
    };

    const putRes = await fetch(`${baseUrl}/students/profile`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(profilePayload)
    });
    const profileRes = await putRes.json();
    console.log("PUT /students/profile OK:", profileRes.preferred_stream);

    // 3. Generate Guide with new profile inputs
    const genPayload = {
        career_inputs: {
            interest_areas: profileRes.interest_areas ? profileRes.interest_areas.split(', ') : [],
            strengths: profileRes.strengths ? profileRes.strengths.split(', ') : [],
            preferred_stream: profileRes.preferred_stream,
            education_level: profileRes.education_level,
            budget_range: profileRes.budget_range,
            location_preference: profileRes.location_preference,
            work_life_balance: profileRes.work_life_balance,
            risk_tolerance: profileRes.risk_tolerance,
            interaction_style: profileRes.interaction_style
        }
    };

    const genRes = await fetch(`${baseUrl}/career-guide/generate`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(genPayload)
    });
    const genData = await genRes.json();
    console.log("POST /career-guide/generate OK. New Guide Title:", genData.title);
}

test().catch(console.error);