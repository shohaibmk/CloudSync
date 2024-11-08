document.addEventListener('DOMContentLoaded', () => {
    const domElementEmail = document.querySelector('#email');
    const domElementPassword = document.querySelector('#password');
    const domElementButtonSignUp = document.querySelector('#buttonSignUp');
    //Toast Objects
    const domElementToast = document.querySelector('#liveToast');
    const domElementToastMeassge = document.querySelector('#toast-body');
    const toast = new bootstrap.Toast(domElementToast);

    /**
     * SignUp button click listener
     */
    domElementButtonSignUp.addEventListener('click', () => {
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
            domElementButtonSignUp.disabled = true;
            domElementToastMeassge.innerHTML = "Creating your account please wait.";
            toast.show();
            createUser(email, password);
        }
        // console.log(email,password);
    });

    /**
     * Function to post the email id and password to the auth.js microservice
     */
    function createUser(email, password) {
        const Data = {
            email: email,
            password: password,
        };
        console.log('data Object', Data);

        const url = "http://127.0.0.1:3003/createUser";

        fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(Data),
          })
          .then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.json();
          })
          .then(data => {
            console.log('User created successfully:', data);
            localStorage.setItem('uid',data.uid);
            window.location.href = "/";
          })
          .catch(error => {
            console.error('Error creating User:', error);
          });
    }
});