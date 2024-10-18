const GEMINI_API_KEY = 'AIzaSyASLwfBaYNUj05qf3aRMMZdY19Kc85nos4'; 

document.getElementById('chatbotBtn').addEventListener('click', function() {
    const apiPrompt = document.getElementById('apiPrompt').value;

    fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents: [
                {
                    parts: [
                        {
                            text: apiPrompt
                        }
                    ]
                }
            ]
        })
    })
    .then(response => response.json())
    .then(data => {
        let rawText = JSON.stringify(data);  
        let textStartIndex = rawText.indexOf('"text":"') + 8;  
        let textEndIndex = rawText.indexOf('"}', textStartIndex);  
        let chatbotText = rawText.substring(textStartIndex, textEndIndex) 
                             .replace(/\\n/g, '') 
                             .trim(); 

        document.getElementById('response').innerText = chatbotText;
    })
    .catch(error => {
        document.getElementById('response').innerText = 'Error: ' + error;
    });
});