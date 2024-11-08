
document.addEventListener('DOMContentLoaded', () => {

    // const provider = new GoogleAuthProvider();
    // provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
    // const auth = getAuth();

    const domElementEmail = document.querySelector('#email');
    const domElementPassword = document.querySelector('#password');
    const domElementButtonSignIn = document.querySelector('#buttonSignin');
    const domElementButtonSignUp = document.querySelector('#buttonSignUp');
    const domElementToastMeassge = document.querySelector('#toast-body');
    const domElementToast = document.querySelector('#liveToast');
    const toast = new bootstrap.Toast(domElementToast);


    /**
     * Signin Button click listener
     */
    domElementButtonSignIn.addEventListener('click', () => {
        login();
    });

    /**
     * SignUp here button click listener
     */
    domElementButtonSignUp.addEventListener('click', () => {
        window.location.href = "/Signup";
    });

    /**
     * Function to first validate email id and password
     */
    function login() {
        const email = domElementEmail.value;
        const password = domElementPassword.value;
        if (email == "" || password == "") {
            // console.log("null", email, password);
            domElementToastMeassge.innerHTML = "Email or Password field empty";
            toast.show();
        }
        else if (password.length < 8 || email.length < 5) {
            // console.log("small", email, password);
            domElementToastMeassge.innerHTML = "Email or Password too short";
            toast.show();
        }
        else {
            domElementButtonSignIn.disabled = true;
            domElementToastMeassge.innerHTML = "Logging in please wait.";
            toast.show();
            loginUser(email, password);
        }
    }
    /**
     * Function to login using email id and password
     */
    function loginUser(email, password) {
        const Data = {
            email: email,
            password: password,
        };
        console.log('data Object', Data);

        const url = "http://127.0.0.1:3003/getuser";

        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(Data),
        })
            .then(response => {
                if (!response.ok) {
                    console.error(response);
                    if (response.code == "auth/invalid-credential") {
                        domElementToastMeassge.innerHTML = "Wrong password !!!";
                        toast.show();
                    }
                    else {
                        domElementToastMeassge.innerHTML = "Login failed please try again !!!";
                        toast.show();
                    }
                    domElementButtonSignIn.disabled = false;
                    throw new Error('Network response was not ok');
                }
                else {
                    return response.json();
                }
            })
            .then(data => {
                console.log('Logged successfully:', data);
                localStorage.setItem('uid', data.uid);
                if (sessionStorage.getItem('buyPremium') == 1) {
                    window.location.href = "/checkout";
                }
                else {
                    window.location.href = "/";
                }
            })
            .catch(error => {
                console.error('Error Logging in:', error);
            });
    }
});
