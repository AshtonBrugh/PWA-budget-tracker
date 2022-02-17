//create a variable to hold db connection
let db;

//establish a connection to IndexedDB db
const request = indexedDB.open('budget_tracker', 1);

//this event will emit if the db version changes
request.onupgradeneeded = function(e) {
    //save a reference to the db
    const db = e.target.result;
    db.createObjectStore('new_tracker', { autoIncrement: true });
};

// //upon a successful
request.onsuccess = function(e) {
//     //when db is successfully created w/ its object store
    db = e.target.result;

    if (navigator.onLine) {
        uploadTracker();
    }
};

//log error
request.onerror = function(e) {
    console.log(e.target.errorCode)
};

function saveRecord(record) {
    const transaction = db.transaction(['new_tracker'], 'readwrite');

    const budgetObjectStore = transaction.objectStore('new_tracker');

    budgetObjectStore.add(record);
};

function uploadTracker() {
    //open a transaction on your db
    const transaction = db.transaction(['new_tracker'], 'readwrite');

    const budgetObjectStore = transaction.objectStore('new_tracker');

    const getAll = budgetObjectStore.getAll();

    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*', 
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if (serverResponse.message) {
                    throw new Error(serverResponse);
                }
                const transaction = db.transaction(['new_tracker'], 'readwrite');
                const budgetObjectStore = transaction.objectStore('new_tracker');
                budgetObjectStore.clear();

                alert('All saved transactions have been submitted!')
            })
            .catch(err => {
                console.log(err)
            });
        }
    };
};

window.addEventListener('online', uploadTracker);

