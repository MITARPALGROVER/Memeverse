
const memeButton = document.getElementById('generateMemeButton');
const memeImage = document.getElementById('memeImage');
const memeTitle = document.getElementById('memeTitle');

// Collection of curated memes stored locally (fallback)
const memeCollection = [
    {
        url: "https://i.imgur.com/DJVWV9v.jpg",
        title: "When the code works on the first try"
    },
    {
        url: "https://i.imgur.com/lz7hOlC.jpg",
        title: "My brain during an exam"
    },
    {
        url: "https://i.imgur.com/ZHWAhpA.jpg",
        title: "Me explaining to my mom why I need a new graphics card"
    },
    {
        url: "https://i.imgur.com/xIolo.jpg",
        title: "Accidentally closing the browser with 100 tabs open"
    },
    {
        url: "https://i.imgur.com/YAGpXPd.png",
        title: "When someone asks if I'm ready for tomorrow's presentation"
    },
    {
        url: "https://i.imgur.com/wYTCtRu.jpg",
        title: "Me trying to fix a bug at 3am"
    },
    {
        url: "https://i.imgur.com/kuc9BXx.jpg",
        title: "When my code passes all the tests"
    },
    {
        url: "https://i.imgur.com/6v8rt.jpg",
        title: "When you finally solve that bug that's been bothering you for days"
    },
    {
        url: "https://i.imgur.com/keMEa4G.jpg",
        title: "How my friends see me vs. how my mom sees me"
    },
    {
        url: "https://i.imgur.com/uJtBxUJ.jpg",
        title: "Me explaining my side project to non-tech friends"
    }
];

// API sources for memes
const apiSources = [
    {
        name: "Reddit API",
        fetchFunction: async () => {
            // Choose from popular meme subreddits
            const subreddits = ['memes', 'dankmemes', 'ProgrammerHumor', 'wholesomememes'];
            const randomSubreddit = subreddits[Math.floor(Math.random() * subreddits.length)];
            
            const response = await fetch(`https://www.reddit.com/r/${randomSubreddit}/top.json?limit=50&t=week`);
            const data = await response.json();
            
            // Filter for image posts onlyy
            const posts = data.data.children.filter(post => {
                const url = post.data.url;
                return url.endsWith('.jpg') || url.endsWith('.png') || url.endsWith('.gif') || url.endsWith('.jpeg');
            });
            
            if (posts.length === 0) throw new Error("No suitable memes found");
            
            const randomPost = posts[Math.floor(Math.random() * posts.length)];
            return {
                url: randomPost.data.url,
                title: randomPost.data.title
            };
        }
    },
    {
        name: "Meme API",
        fetchFunction: async () => {
            const response = await fetch('https://meme-api.com/gimme');
            const data = await response.json();
            return {
                url: data.url,
                title: data.title
            };
        }
    },
    {
        name: "ImgFlip API",
        fetchFunction: async () => {
            const response = await fetch('https://api.imgflip.com/get_memes');
            const data = await response.json();
            
            if (!data.success) throw new Error("ImgFlip API failed");
            
            const memes = data.data.memes;
            const randomMeme = memes[Math.floor(Math.random() * memes.length)];
            
            return {
                url: randomMeme.url,
                title: randomMeme.name
            };
        }
    },
    {
        name: "Giphy API",
        fetchFunction: async () => {
            // Note: In a production environment, you'd want to use an API key
            // This is using the public beta key - consider replacing with your own
            const apiKey = "dc6zaTOxFJmzC"; // Public beta key
            const searchTerms = ["funny", "meme", "laugh", "joke"];
            const randomTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];
            
            const response = await fetch(`https://api.giphy.com/v1/gifs/random?api_key=${apiKey}&tag=${randomTerm}&rating=g`);
            const data = await response.json();
            
            return {
                url: data.data.images.original.url,
                title: data.data.title || "Funny GIF from Giphy"
            };
        }
    }
];

// Keep track of recently shown memes to avoid repetition
let recentlyShownUrls = [];
const maxRecentlyShown = 10;

// Track which APIs have failed in the current attempt
let failedApis = [];

// Function to generate a meme
async function generateMeme() {
    memeTitle.textContent = 'Loading meme...';
    
    // Reset failed APIs for new attempt
    failedApis = [];
    
    // Try each API in sequence until one works
    for (let i = 0; i < apiSources.length; i++) {
        // Select an API randomly from those that haven't failed yet
        const availableApis = apiSources.filter(api => !failedApis.includes(api.name));
        
        // If all APIs failed, use local collection
        if (availableApis.length === 0) {
            useLocalMeme();
            return;
        }
        
        const selectedApiIndex = Math.floor(Math.random() * availableApis.length);
        const selectedApi = availableApis[selectedApiIndex];
        
        try {
            console.log(`Trying ${selectedApi.name}...`);
            const meme = await selectedApi.fetchFunction();
            
            // Check if this meme URL was recently shown
            if (recentlyShownUrls.includes(meme.url)) {
                console.log("Skipping recently shown meme, trying again...");
                continue;
            }
            
            // Update the UI
            memeImage.src = meme.url;
            memeTitle.textContent = meme.title;
            
            // Add to recently shown
            recentlyShownUrls.push(meme.url);
            if (recentlyShownUrls.length > maxRecentlyShown) {
                recentlyShownUrls.shift(); // Remove oldest
            }
            
            return;
        } catch (error) {
            console.error(`Error with ${selectedApi.name}:`, error);
            failedApis.push(selectedApi.name);
        }
    }
    
    // If all APIs fail, use local collection
    useLocalMeme();
}

// Function to use a local meme when APIs fail
function useLocalMeme() {
    // Filter out recently shown memes
    const availableMemes = memeCollection.filter(meme => !recentlyShownUrls.includes(meme.url));
    
    // If all memes have been shown recently, reset and use all
    const memePool = availableMemes.length > 0 ? availableMemes : memeCollection;
    
    // Select random meme
    const randomIndex = Math.floor(Math.random() * memePool.length);
    const meme = memePool[randomIndex];
    
    // Update UI
    memeImage.src = meme.url;
    memeTitle.textContent = meme.title;
    
    // Add to recently shown
    recentlyShownUrls.push(meme.url);
    if (recentlyShownUrls.length > maxRecentlyShown) {
        recentlyShownUrls.shift(); // Remove oldest
    }
}

// Add event listener for button click
memeButton.addEventListener('click', generateMeme);

// Generate a meme when the page loads
document.addEventListener('DOMContentLoaded', generateMeme);
