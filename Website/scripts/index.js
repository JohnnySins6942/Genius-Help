const guideList = document.querySelector('.questions');
const loggedOutLinks = document.querySelectorAll('.logged-out');
const loggedInLinks = document.querySelectorAll('.logged-in');
const accountDetails = document.querySelector('.account-details');
const myQuestionList = document.querySelector('.myQuestions');
const setupUI = (user) => {
    if (user) {
        //account info
        db.collection('users').doc(user.uid).get().then(doc => {
                const html = `
                <div>Logged in as ${user.email}</div>
                <div>${doc.data().bio}</div>
                `;
                accountDetails.innerHTML = html;
            })
            // ui
        loggedInLinks.forEach(item => item.style.display = 'block');
        loggedOutLinks.forEach(item => item.style.display = 'none');
    } else {
        //hide account
        accountDetails.innerHTML = '';
        loggedInLinks.forEach(item => item.style.display = 'none');
        loggedOutLinks.forEach(item => item.style.display = 'block');
    }
}



//update single answer ui
function updateSingleAnswerUI(id) {
    let html = '';

    db.collection('guides').doc(id).get().then(doc => {
        var data = doc.data();
        if (data.answer != null) {
            var list = data.answer;
            var tempAnswer = '.S' + id + 'id';
            var answerList = document.querySelector(tempAnswer);

            for (let i = 0; i < list.length; i++) {
                var tempAnswerOBJ = {
                    title: list[i].title,
                    content: list[i].content,
                    ContributorEmail: list[i].ContributorEmail,
                    timePosted: list[i].timePosted,
                    upvotes: list[i].upvotes
                };
                var time = tempAnswerOBJ.timePosted.toDate();
                const li = `
                <li>
                <hr style="border-top: 1px dashed red"> 
                <div style="float:left;">
                <input type="image" onclick="vote('${doc.id}', '${i}', true);"src="img/Upvote.png" style="width:45px; height:45px;"/>
                <h4 style="text-align:center;">${tempAnswerOBJ.upvotes}</h6>
                <input type="image" onclick="vote('${doc.id}', '${i}', false);" src="img/Downvote.png" style="width:45px; height:45px;"/>
                </div>
                            <h6>Contributor email: ${tempAnswerOBJ.ContributorEmail}</h6>
                            <p>Posted at: ${time}</p>
                            <br>
                            <hr> 
                            <h3>${tempAnswerOBJ.title}</h3>
                            <p>${tempAnswerOBJ.content}</p>
                            <br>
                            </div>
                            </div>
            
                </li>
        `;
                html += li;
                answerList.innerHTML = html;
            }
        }
    })

}

//setup questions
const setupGuides = (data) => {

    numberOfQuestions = 0;
    if (data.length) {
        let html = '';
        data.forEach(doc => {
            var user = firebase.auth().currentUser;
            if (numberOfQuestions < 25) {
                const guide = doc.data();
                li = ``;
                if (user.email == guide.Email) {
                    li = `
                    <li>
                        <div class="collapsible-header grey lighten-4">${guide.title} (posted by - ${guide.Email})</div>
                        <div class="collapsible-body white">${guide.Content}

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
                        <button onclick="questionSubmit('${doc.id}' , '${doc.id}title')" class="btn yellow darken-2 z-depth-1.5">Submit
                        </button>
                        <br>
                        <br>
                        <button onClick="deleteQustion('${doc.id}', '${guide.Email}')"class="btn red darken-0.5 z-depth-1.5 S${doc.id}DELETE" style= "display: block;">delete question</button>
                        </div>
                        </div>
                    </li>
                `;
                } else if (user.email != guide.Email) {
                    li = `
                    <li>
                        <div class="collapsible-header grey lighten-4">${guide.title} (posted by - ${guide.Email})</div>
                        <div class="collapsible-body white">${guide.Content}
                       

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
                        <button onclick="questionSubmit('${doc.id}' , '${doc.id}title')" class="btn yellow darken-2 z-depth-1.5">Submit
                        </button>
                        <br>
                        <br>
                        <button class="btn red darken-0.5 z-depth-1.5 S${doc.id}DELETE" style= "display: none;">delete question</button>
                        </div>
                        </div>
                    </li>
                `;
                }

                html += li;
                numberOfQuestions += 1;
                guideList.innerHTML = html;
                displayImage(doc.id);
            }
        });
    }

}

//display images attached to questions
function displayImage(id) {
    var tempAnswer = '.S' + id + 'Image';
    var Storage = firebase.storage();
    let html = '';

    db.collection("guides").doc(id).get().then(doc => {
        var data = doc.data();
        if (data.Images != null) {
            var list = data.Images;
            for (let i = 0; i < list.length; i++) {
                const imageList = document.querySelector(tempAnswer);
                Storage.ref(list[i]).getDownloadURL().then(function(url) {
                    var link = url.toString();
                    const li = `
                    <li>
                    <img id = "${url}" src=${link} alt="imageList">
                    </li>
                    `;
                    html += li;
                    imageList.innerHTML = html;
                }).catch(function(error) {
                    console.log("ERROR!!!");
                }).then(function(cont) {
                    console.log("complete");
                })
            }
        }
    })
}

//deletes questions
function deleteQustion(id, email) {
    var user = firebase.auth().currentUser;
    var storage = firebase.storage();

    if (user.email == email) {
        db.collection("guides").doc(id).get().then(doc => {
            var data = doc.data();
            if (data.Images != null) {
                var list = data.Images;
                for (let i = 0; i < list.length; i++) {
                    // Create a reference to the file to delete
                    var imageRef = storage.ref(list[i]);

                    // Delete the file
                    imageRef.delete().then(function() {
                        console.log("succesful Delete");
                    }).catch(function(error) {
                        console.log(error);
                    });
                }
            }
        }).then(function(then) {
            db.collection("guides").doc(id).delete().then(function() {
                console.log("Document successfully deleted!");
                location.reload();
            }).catch(function(error) {
                console.error("Error removing document: ", error);
            });
        })
    }
}

//update specific question ui
const updateMyAnswerUI = (user) => {
    if (user) {
        let html = '';
        db.collection('users').doc(user.uid).get().then(doc => {
            var data = doc.data();
            if (data.questions != null) {
                var list = data.questions;
                for (let i = 0; i < list.length; i++) {
                    var Ref = db.collection("guides").doc(list[i]);
                    Ref.get().then(doc => {
                        if (doc.exists) {
                            var g = doc.data()
                            const li = `
                                <li>
                            
                                <p><button onclick="displaySingle('${doc.id}')" class="w3-btn w3-block w3-teal">${g.title}</button></p>
                                </li>
                                `;
                            html += li;
                            myQuestionList.innerHTML = html;
                        } else {
                            db.collection('users').doc(user.uid).update({
                                questions: firebase.firestore.FieldValue.arrayRemove(list[i])
                            });
                        }
                    });
                }
            }
        })
    }
}

//update answers 
const updateAnswerUI = (id) => {
    if (id.length) {
        id.forEach(doc => {
            var guide = doc.data();
            if (guide.answer != null) {
                var tempAnswer = '.S' + doc.id + 'id';
                var answerList = document.querySelector(tempAnswer);
                if (answerList != null) {
                    let html = '';
                    var list = guide.answer;
                    for (let i = 0; i < list.length; i++) {
                        var tempAnswerOBJ = {
                            title: list[i].title,
                            content: list[i].content,
                            ContributorEmail: list[i].ContributorEmail,
                            timePosted: list[i].timePosted,
                            upvotes: list[i].upvotes
                        };
                        var time = tempAnswerOBJ.timePosted.toDate();

                        const li = `
    <li>
    <hr style="border-top: 1px dashed red"> 
    <div style="float:left;">
    <input type="image" onclick="vote('${doc.id}', '${i}', true);"src="img/Upvote.png" style="width:45px; height:45px;"/>
    <h4 style="text-align:center;">${tempAnswerOBJ.upvotes}</h6>
    <input type="image" onclick="vote('${doc.id}', '${i}', false);" src="img/Downvote.png" style="width:45px; height:45px;"/>
    </div>
                <h6>Contributor email: ${tempAnswerOBJ.ContributorEmail}</h6>
                <p>Posted at: ${time}</p>
                <br>
                <hr> 
                <h3>${tempAnswerOBJ.title}</h3>
                <p>${tempAnswerOBJ.content}</p>
                <br>
                </div>
                </div>

    </li>
    `;
                        html += li;
                        answerList.innerHTML = html;
                    }
                }
            }
        });
    }
}

function vote(id, i, integer) {
    var user = firebase.auth().currentUser;
    var AnswerVoterObject = {
        user: user.uid,
        Integer: integer
    }
    if (integer == true) {
        console.log("voted");
        db.collection("guides").doc(id).get().then(doc => {
            var data = doc.data();
            var AnswerData = data.answer;
            var ExpectedVote = 0;
            var hasFoundVoter = false;
            if (AnswerData[i].voters != null) {
                for (let p = 0; p < AnswerData[i].voters.length; p++) {
                    var g = AnswerData[i].voters[p];
                    if (g.user == user.uid) {
                        if (g.integer == true) {
                            ExpectedVote = -1;
                            g.integer = false;
                        } else {
                            ExpectedVote = 2;
                            g.integer = true;
                        }
                        hasFoundVoter = true;
                        delete AnswerData[i].voters[p];
                        console.log(AnswerData[i]);
                        if (AnswerData[i].voters != null) {
                            AnswerData[i].voters.push(AnswerVoterObject);
                        } else {
                            AnswerData[i] = {
                                upvotes: UPVOTES,
                                ContributorEmail: AnswerData[i].ContributorEmail,
                                content: AnswerData[i].content,
                                timePosted: AnswerData[i].timePosted,
                                title: AnswerData[i].title,
                                voters: []
                            }
                            AnswerData[i].voters.push(AnswerVoterObject);
                        }
                        break;
                    }
                }
                if (hasFoundVoter) {
                    var UPVOTES = AnswerData.upvotes + ExpectedVote;
                    AnswerData[i] = {
                        upvotes: UPVOTES,
                        ContributorEmail: AnswerData[i].ContributorEmail,
                        content: AnswerData[i].content,
                        timePosted: AnswerData[i].timePosted,
                        title: AnswerData[i].title,
                        voters: AnswerData[i].voters
                    }
                    console.log(AnswerData);
                    db.collection('guides').doc(id).update({
                        answer: AnswerData,
                    }).catch(err => {
                        console.log(err.message);
                    })
                } else {
                    AnswerData[i].voters.push(AnswerVoterObject);
                    ExpectedVote = 1;
                    var UPVOTES = AnswerData[i].upvotes + ExpectedVote;
                    AnswerData[i].upvotes = UPVOTES;
                    console.log(AnswerData);
                    db.collection('guides').doc(id).update({
                        answer: AnswerData,
                    })
                }

            } else {

                ExpectedVote = 1;
                var UPVOTES = AnswerData[i].upvotes + ExpectedVote;
                AnswerData[i] = {
                    upvotes: UPVOTES,
                    ContributorEmail: AnswerData[i].ContributorEmail,
                    content: AnswerData[i].content,
                    timePosted: AnswerData[i].timePosted,
                    title: AnswerData[i].title,
                    voters: []
                }
                AnswerData[i].voters.push(AnswerVoterObject);
                db.collection('guides').doc(id).update({
                    answer: AnswerData,
                })
            }
        })
    } else {
        console.log("downvoted");
        db.collection("guides").doc(id).get().then(doc => {
            var data = doc.data();
            var AnswerData = data.answer;
            var ExpectedVote = 0;
            var hasFoundVoter = false;
            if (AnswerData[i].voters != null) {
                for (let j = 0; j < AnswerData[i].voters.length; j++) {
                    var g = AnswerData[i].voters[j];
                    if (g.user == user.uid) {
                        if (g.integer == true) {
                            ExpectedVote = -2;
                            g.integer = false;
                        } else {
                            ExpectedVote = 1;
                            g.integer = true;
                        }
                        hasFoundVoter = true;
                        delete AnswerData[i].voters[j];
                        if (AnswerData[i].voters != null) {
                            AnswerData[i].voters.push(AnswerVoterObject);
                        } else {
                            AnswerData[i] = {
                                upvotes: UPVOTES,
                                ContributorEmail: AnswerData[i].ContributorEmail,
                                content: AnswerData[i].content,
                                timePosted: AnswerData[i].timePosted,
                                title: AnswerData[i].title,
                                voters: []
                            }
                            AnswerData[i].voters.push(AnswerVoterObject);
                        }
                        break;
                    }
                }
                if (hasFoundVoter) {
                    var UPVOTES = AnswerData[i].upvotes + ExpectedVote;
                    AnswerData[i].upvotes = UPVOTES;
                    console.log(AnswerData);
                    db.collection('guides').doc(id).update({
                        answer: AnswerData,
                    }).catch(err => {
                        console.log(err.message);
                    })
                } else {
                    ExpectedVote = -1;
                    var UPVOTES = AnswerData[i].upvotes + ExpectedVote;
                    AnswerData[i].upvotes = UPVOTES;
                    AnswerData[i].voters.push(AnswerVoterObject);
                    db.collection('guides').doc(id).update({
                        answer: AnswerData,
                    })
                }

            } else {
                ExpectedVote = -1;
                var UPVOTES = AnswerData[i].upvotes + ExpectedVote;
                AnswerData[i] = {
                    upvotes: UPVOTES,
                    ContributorEmail: AnswerData[i].ContributorEmail,
                    content: AnswerData[i].content,
                    timePosted: AnswerData[i].timePosted,
                    title: AnswerData[i].title,
                    voters: []
                }
                AnswerData[i].voters.push(AnswerVoterObject);
                db.collection('guides').doc(id).update({
                    answer: AnswerData,
                })
            }
        })
    }
}
document.addEventListener('DOMContentLoaded', function() {
    var modals = document.querySelectorAll('.modal');
    M.Modal.init(modals);

    var items = document.querySelectorAll('.collapsible');
    M.Collapsible.init(items);
});

// Get the modal
var modal = document.getElementById("modal-create");

// Get the button that opens the modal
var btn = document.getElementById("CreateGuide");


// When the user clicks the button, open the modal 
btn.onclick = function() {
        modal.style.display = "block";
    }
    // When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}