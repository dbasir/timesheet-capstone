const isEmpty = (value) => {
    if (value === '')
        return true;
    else
        return false;
}
const validateFormForEmpty = (username, email, password, confirmpassword) => {
    if (isEmpty(username.trim()) || isEmpty(email.trim()) || isEmpty(password.trim()) || isEmpty(confirmpassword.trim())) {
        return "All the fields are mandatory.";
    }
    else if(password!==confirmpassword){
        return "Password and Confirm Password do not match";
    }
    else{
        return "valid";
    }
}

const updatePassword = (username, email, password)=>{

}

module.exports = { validateFormForEmpty }
