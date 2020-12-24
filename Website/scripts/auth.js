isInSingle = false;
const imageList = document.querySelector('.images');

//listen for auth status changes
auth.onAuthStateChanged(user => {
    if (user) {
        //get data
        db.collection('guides').onSnapshot(snapshot => {
            if (!isInSingle) {
                setupGuides(snapshot.docs);
                updateAnswerUI(snapshot.docs);
            }
            setupUI(user);
            updateMyAnswerUI(user, snapshot.docs);
        }, err => {
            console.log(err.message);
        }).catch(err => {
            console.log(err.message);
        })
    } else {
        setupUI();
        setupGuides([]);
        updateMyAnswerUI();
        updateAnswerUI([]);
    }
})

function similarity(s1, s2) {
    var longer = s1;
    var shorter = s2;
    if (s1.length < s2.length) {
        longer = s2;
        shorter = s1;
    }
    var longerLength = longer.length;
    if (longerLength == 0) {
        return 1.0;
    }
    return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}

function editDistance(s1, s2) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();

    var costs = new Array();
    for (var i = 0; i <= s1.length; i++) {
        var lastValue = i;
        for (var j = 0; j <= s2.length; j++) {
            if (i == 0)
                costs[j] = j;
            else {
                if (j > 0) {
                    var newValue = costs[j - 1];
                    if (s1.charAt(i - 1) != s2.charAt(j - 1))
                        newValue = Math.min(Math.min(newValue, lastValue),
                            costs[j]) + 1;
                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                }
            }
        }
        if (i > 0)
            costs[s2.length] = lastValue;
    }
    return costs[s2.length];
}

function Search() {
    var field = document.getElementById("searchTerm").value;

    var refs = db.collection("guides");

    var res = field.split(" ");
    var g = res.length;

    for (let i = 0; i < g; i++) {
        let similarityList = [];
        var firstLetter = res[i].charAt(0).toLowerCase();
        k = dic(firstLetter);
        for (let p = 0; p < k.length; p++) {
            var result = similarity(res[i], k[p]);
            similarityList.push(result);
        }
        for (let z = 0; z < similarityList.length; z++) {
            if (similarityList[z] >= .6 && res[i] != k[z]) {
                res.push(k[z]);
            }
        }
    }
    g = res.length;

    for (let i = 0; i < g; i++) {
        if (res[i] != "") {
            p = res[i];
            var uppercase = p[0] === p[0].toUpperCase();

            if (uppercase == true) {
                var newStringCapital = res[i].toLowerCase();
                res.push(newStringCapital);
            } else if (uppercase == false) {
                var newStringLowerCase = res[i].charAt(0).toUpperCase() + res[i].slice(1);
                res.push(newStringLowerCase);
            }
        }
    }
    g = res.length;

    for (let i = 0; i < g; i++) {
        if (res[i] != "") {
            if (res[i].charAt[res[i].length - 1] != 's') {
                pluralString = res[i] + 's';
                res.push(pluralString);
            }
        }
    }

    guideList.innerHTML = null;

    for (let i = 0; i < res.length; i++) {
        Result = refs.where("keywords", 'array-contains', res[i]).get()
            .then(function(querySnapshot) {
                querySnapshot.forEach(function(doc) {
                    isInSingle = true;
                    displaySingleSearch(doc.id);
                })

            }).catch(function() {
                console.log("caught");
            })
    }
}
//image 
var uploader = document.getElementById('uploader');
var fileButton = document.getElementById('fileButton');
var storage = firebase.storage();
var refStorage = storage.ref();
var ImagesArray = [];

fileButton.addEventListener('change', function(e) {
    //get file
    var file = e.target.files[0];

    let html = '';

    filePath = 'question_images/' + file.name;
    //create a storage ref
    storageRef = firebase.storage().ref(filePath);

    ImagesArray.push(filePath);

    var task = storageRef.put(file);

    //upload file
    task.on('state_changed', function progress(snapshot) {
            var percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            uploader.value = percentage
        },

        function error(err) {
            console.log("unable to upload image!");
        },
        function complete() {
            refStorage.child('question_images/' + file.name).getDownloadURL().then(function(url) {
                const li = `
                <li>
                <img id = "${file.name}" src="images/${file.name}" alt="imageList">
                </li>
            `;
                html += li;
                imageList.innerHTML += html;
                document.getElementById(file.name).src = url;
            }).catch(err => {
                console.log(err.message);
            })

        });

});


//create guide
const createForm = document.querySelector('#create-form');
createForm.addEventListener('submit', (e) => {
        e.preventDefault();
        var user = firebase.auth().currentUser;
        var Keys = createForm['title'].value.split(" ");
        db.collection('guides').add({
            title: createForm['title'].value,
            Content: createForm['content'].value,
            Email: user.email,
            Images: ImagesArray,
            keywords: Keys
        }).then(function(docRef) {
            db.collection("users").doc(user.uid).update({
                questions: firebase.firestore.FieldValue.arrayUnion(docRef.id)
            }).then(function(docref) {
                location.reload();
            });
            //reset form
            const modal = document.querySelector('#modal-create');
            M.Modal.getInstance(modal).close();
            createForm.reset();
        }).catch(err => {
            console.log(err.message);
        })
    })
    //display all questions
function searchForAnswers() {
    isInSingle = false;
    location.reload();
}

//display specifc question
function displaySingle(id) {
    isInSingle = true;
    let html = '';
    const guideList = document.querySelector('.questions');
    db.collection('guides').doc(id).get().then(doc => {
        var data = doc.data();
        const li = `
    <li>
        <div class="collapsible-header grey lighten-4">${data.title}</div>
        <div class="collapsible-body white">${data.Content}
        
        
        <ul class="S${doc.id}Image"  style="overflow-y: auto;">
        </ul>

        <div class="container" style="margin-top: 40px;">
        <ul class="collapsible z-depth-0 " style="border: none;">
          </ul>
          <div class="S${doc.id}id"></div>
        </div>

        <h3>Answer the question!</h3>
        
        <div class="input-field">
        <textarea id='${doc.id}title' class="materialize-textarea" required></textarea>
        <label for="content">Title...</label>
        <div class="input-field">
        <textarea id='${doc.id}' class="materialize-textarea" required></textarea>
        <label for="content">Answer...</label>
        <div>
        <button onclick="questionSubmit('${doc.id}' , '${doc.id}title')" class="btn yellow darken-2 z-depth-0">Submit
        </button>
        <br>
        <br>
        <button onClick="deleteQustion('${doc.id}', '${data.Email}')"class="btn red darken-0.5 z-depth-1.5 S${doc.id}DELETE" style= "display: block;">delete question</button>
        </div>
        </div>
        </div>
        </div>
    </li>
`;
        html += li

        isInSingle = true;
        const modal = document.querySelector('#modal-MyQuestions');
        M.Modal.getInstance(modal).close();
        guideList.innerHTML = html;
        updateSingleAnswerUI(id);
        displayImage(id);
    });
}
//display specifc question
function displaySingleSearch(id) {
    isInSingle = true;
    let html = '';
    const guideList = document.querySelector('.questions');
    db.collection('guides').doc(id).get().then(doc => {
        var data = doc.data();
        const li = `
    <li>
        <div class="collapsible-header grey lighten-4">${data.title} (posted by - ${data.Email})</div>
        <div class="collapsible-body white">${data.Content}
        
        <ul class="S${doc.id}Image"  style="overflow-y: auto;">
        </ul>
        
        <div class="container" style="margin-top: 40px;">
        <ul class="collapsible z-depth-0 " style="border: none;">
          </ul>
          <div class="S${doc.id}id"></div>
        </div>

        <h3>Answer the question!</h3>
        
        <div class="input-field">
        <textarea id='${doc.id}title' class="materialize-textarea" required></textarea>
        <label for="content">Title...</label>
        <div class="input-field">
        <textarea id='${doc.id}' class="materialize-textarea" required></textarea>
        <label for="content">Answer...</label>
        <div>
        <button onclick="questionSubmit('${doc.id}' , '${doc.id}title')" class="btn yellow darken-2 z-depth-0">Submit
        </button>
        <br>
        <br>
        <button onClick="deleteQustion('${doc.id}', '${data.Email}')"class="btn red darken-0.5 z-depth-1.5 S${doc.id}DELETE" style= "display: block;">delete question</button>
        </div>
        </div>
        </div>
        </div>
    </li>
`;
        html += li

        isInSingle = true;
        const modal = document.querySelector('#modal-MyQuestions');
        M.Modal.getInstance(modal).close();
        guideList.innerHTML += html;
        updateSingleAnswerUI(id);
        displayImage(id);
    });
}

//submit questions
function questionSubmit(id, title) {
    const Answer = document.getElementById(id).value;
    const answerTitle = document.getElementById(title).value;
    var user = firebase.auth().currentUser;
    // 1. get current aswers
    var answerObj = {
        title: answerTitle,
        content: Answer,
        ContributorEmail: user.email,
        timePosted: new Date(),
        upvotes: 0
    };
    // update exisintg aswers with the new one
    db.collection("guides").doc(id).update({
        answer: firebase.firestore.FieldValue.arrayUnion(answerObj)
    }).then(doc => {
        location.reload();
    });
    db.collection('guides').onSnapshot(snapshot => {
        updateMyAnswerUI(user, snapshot.docs);
    });
    updateSingleAnswerUI(id);

}

//signup
const signupForm = document.querySelector('#signup-form');
signupForm.addEventListener('submit', (e) => {
    e.preventDefault();

    //get user info
    const email = signupForm['signup-email'].value;
    const password = signupForm['signup-password'].value;

    //sign up the user
    auth.createUserWithEmailAndPassword(email, password).then(cred => {
        return db.collection('users').doc(cred.user.uid).set({
            bio: signupForm['signup-bio'].value
        });
    }).then(() => {
        const modal = document.querySelector('#modal-signup');
        M.Modal.getInstance(modal).close();
        signupForm.reset();
    }).catch(err => {
        signupForm.querySelector('.error').innerHTML = err.message;
    });
});

//logout
const logout = document.querySelector('#logout');
logout.addEventListener('click', (e) => {
    e.preventDefault();
    auth.signOut();
    location.reload();
});

//login
const loginForm = document.querySelector('#login-form');
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    //get user info
    const email = loginForm['login-email'].value;
    const password = loginForm['login-password'].value;

    auth.signInWithEmailAndPassword(email, password).then(cred => {

        //close the login modal and reset form
        const modal = document.querySelector('#modal-login');
        M.Modal.getInstance(modal).close();
        loginForm.reset();
        signupForm.querySelector('.error').innerHTML = '';
    }).catch(err => {
        loginForm.querySelector('.error').innerHTML = err.message;
    })
});