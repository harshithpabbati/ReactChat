import firebase from 'firebase'

const config = {
    apiKey: "AIzaSyCMHv2oL4PHtAgSIuGTqykR0UIf8AlLpPI",
    authDomain: "react-chat-e5b15.firebaseapp.com",
    databaseURL: "https://react-chat-e5b15.firebaseio.com",
    projectId: "react-chat-e5b15",
    storageBucket: "react-chat-e5b15.appspot.com",
    messagingSenderId: "668848574057",
}
firebase.initializeApp(config)

export const myFirebase = firebase
export const myFirestore = firebase.firestore()
export const myStorage = firebase.storage()
