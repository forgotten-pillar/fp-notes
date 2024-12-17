import { getFullSlug } from "../../util/path"

const fetchPostHogQuery = async () => {
    const path = getFullSlug(window)
    const projectId = 30357
    const host = 'notes.forgottenpillar.com'
    const query = `select count()
            from events
            where event = '$pageview' and properties.$pathname = '/${path}' and properties.$host = '${host}'
            limit 1000000000000`

    const url = `https://eu.posthog.com/api/projects/${projectId}/query`;
    const apiKey = "phx_cEpICdTtU1A1WCKXmr6THSOzlq3egmVR45YQUoaCthz0rK";

    const payload = {
        query: {
            kind: "HogQLQuery",
            query
        }
    };

    const counterElement = document.getElementById('page-view-counter')

    if(counterElement){
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify(payload)
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
    
            const data = await response.json();
            const counter = data.results[0][0]
            if(counter) {
                counterElement.textContent = counter;
            } else {
                throw new Error('Unknown result')
            }
            
        } catch (error) {
            console.error("Error fetching data:", error);
            counterElement.textContent = '?'
        }
    }
    
};


document.addEventListener("nav", () => {
    fetchPostHogQuery()
})