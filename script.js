const USER_ID = '31241';
const inventoryGrid = document.getElementById('inventory-grid');
const totalRapDisplay = document.getElementById('total-rap');

let offerItems = [];
let requestItems = [];

async function fetchInventory() {
    try {
        let totalRap = 0;
        inventoryGrid.innerHTML = '';
        
        let currentPage = 1;
        let hasMoreItems = true;

        while (hasMoreItems) {
            const response = await fetch(`/api/proxy?userId=${USER_ID}&page=${currentPage}`);
            if (!response.ok) throw new Error("Network response was not ok");
            
            const htmlText = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlText, 'text/html');
            const itemCards = doc.querySelectorAll('.card.bg-dark');
            
            if (itemCards.length === 0) {
                hasMoreItems = false;
                break;
            }

            itemCards.forEach(card => {
                const body = card.querySelector('.card-body');
                if(!body) return;
                
                const paragraphs = body.querySelectorAll('p');
                const imgEl = card.querySelector('img');
                
                let imgSrc = imgEl ? (imgEl.getAttribute('data-src') || imgEl.getAttribute('src')) : '';
                if (imgSrc && !imgSrc.startsWith('http')) {
                    imgSrc = imgSrc.startsWith('/') 
                        ? 'https://www.pekora.zip' + imgSrc 
                        : 'https://www.pekora.zip/' + imgSrc;
                }

                if (paragraphs.length >= 2) {
                    const itemName = paragraphs[0].innerText;
                    const rapText = paragraphs[1].innerText.replace('RAP: ', '').replace(/,/g, '').trim();
                    const itemRap = parseInt(rapText, 10) || 0;
                    
                    totalRap += itemRap;
                    const itemObj = { name: itemName, rap: itemRap, assetThumbnailUrl: imgSrc };

                    const myCard = document.createElement('div');
                    myCard.className = 'item-card';
                    myCard.innerHTML = `
                        <img src="${imgSrc}" alt="${itemName}">
                        <div class="item-name" title="${itemName}">${itemName}</div>
                        <div class="item-rap">RAP: ${itemRap.toLocaleString()}</div>
                    `;
                    
                    myCard.addEventListener('click', () => addToOffer(itemObj));
                    inventoryGrid.appendChild(myCard);
                }
            });
            
            currentPage++;
        }

        totalRapDisplay.innerText = `Total RAP: ${totalRap.toLocaleString()}`;

    } catch (error) {
        console.error("Грешка при зареждане на инвентара:", error);
        totalRapDisplay.innerText = "Total RAP: Error loading data";
    }
}

// Функции за калкулатора
function addToOffer(item) {
    offerItems.push(item);
    updateCalculatorUI();
}

function updateCalculatorUI() {
    const offerSlots = document.getElementById('offer-slots');
    const offerRapDisplay = document.getElementById('offer-rap');
    
    offerSlots.innerHTML = '';
    let offerRap = 0;

    offerItems.forEach((item, index) => {
        offerRap += item.rap || 0;
        
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item-card';
        itemDiv.style.width = '80px';
        itemDiv.innerHTML = `<img src="${item.assetThumbnailUrl || ''}" style="width:50px; height:50px;"><br><span style="font-size:10px;">${item.rap}</span>`;
        
        itemDiv.addEventListener('click', () => {
            offerItems.splice(index, 1);
            updateCalculatorUI();
        });
        
        offerSlots.appendChild(itemDiv);
    });

    offerRapDisplay.innerText = offerRap.toLocaleString();
}

// Зареждане на данните при отваряне
fetchInventory();
