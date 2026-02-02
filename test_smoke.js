
(async () => {
    const fetch = (await import('node-fetch')).default;

    // Use NGINX port (80) or Gateway port (3000) for local testing without docker
    const USE_DOCKER = process.env.USE_DOCKER === 'true';
    const BASE_URL = USE_DOCKER ? 'http://localhost/api/v1' : 'http://localhost:3000/api/v1';

    // Mock Auth for testing (Gateway verifies Firebase token but we mocked it in config/firebase.js if no creds)
    let AUTH_TOKEN = 'valid-token';
    let API_KEY = '';
    let PROJECT_ID = '';
    let TEMPLATE_ID = '';

    console.log(`=== Nardaa Microservices Smoke Test ===`);
    console.log(`Target: ${BASE_URL}`);

    try {
        // 1. Health Check (Gateway routing?)
        // Our Gateway health is /health. NGINX routes /health -> gateway/health
        // Internal services don't have public health checks via gateway in my config yet, but Gateway does.
        const healthUrl = USE_DOCKER ? 'http://localhost/health' : 'http://localhost:3000/health';
        const health = await fetch(healthUrl);
        if (health.status !== 200) throw new Error(`Health check failed: ${health.status}`);
        console.log(`[PASS] Health Check: OK`);

        // 2. Create Project (Gateway -> Project Service)
        const createRes = await fetch(`${BASE_URL}/projects`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${AUTH_TOKEN}` },
            body: JSON.stringify({ name: 'Microservice Test Project' })
        });
        const projectData = await createRes.json();

        if (createRes.status === 201) {
            API_KEY = projectData.api_key;
            PROJECT_ID = projectData.id;
            console.log(`[PASS] Project Created: ${PROJECT_ID}`);
        } else {
            console.error(projectData);
            throw new Error("Failed to create project");
        }

        // 3. Create Template (Gateway -> Template Service)
        const tplRes = await fetch(`${BASE_URL}/templates`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${AUTH_TOKEN}` },
            body: JSON.stringify({
                project_id: PROJECT_ID,
                name: 'MICRO_WELCOME',
                html: '<h1>Hello Microservice {{name}}</h1>',
                text: 'Hello {{name}}',
                required_variables: ['name']
            })
        });
        const tplData = await tplRes.json();
        if (tplRes.status === 201) {
            TEMPLATE_ID = tplData.id;
            console.log(`[PASS] Template Created: ${TEMPLATE_ID}`);
        } else {
            throw new Error(`Failed to create template: ${JSON.stringify(tplData)}`);
        }

        // 4. Send Email (Gateway -> Email Service -> RabbitMQ)
        console.log(`\n[Test] Sending Email with Key: ${API_KEY}...`);
        const sendRes = await fetch(`${BASE_URL}/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': API_KEY
            },
            body: JSON.stringify({
                template: TEMPLATE_ID,
                data: { name: 'Docker User', email: 'docker@example.com' }
            })
        });
        const sendData = await sendRes.json();

        if (sendRes.status === 200) {
            console.log(`[PASS] Email Queued! ID: ${sendData.id}`);
            console.log("=== SUCCESS: Full Microservices Flow Verified. Check Worker logs. ===");
        } else {
            console.error(`[FAIL] Email Send Failed: ${JSON.stringify(sendData)}`);
        }

    } catch (error) {
        console.error("\n[Test Error]", error);
        // process.exit(1); 
    }
})();
