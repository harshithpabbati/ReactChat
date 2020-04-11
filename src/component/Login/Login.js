import firebase from 'firebase'
import React, {Component} from 'react'
import ReactLoading from 'react-loading'
import {withRouter} from 'react-router-dom'
import 'react-toastify/dist/ReactToastify.css'
import {myFirebase, myFirestore} from '../../config/MyFirebase'
import './Login.css'
import {AppString} from './../Const'

class Login extends Component {
    constructor(props) {
        super(props)
        this.provider = new firebase.auth.GoogleAuthProvider()
        this.state = {
            isLoading: true
        }
    }

    componentDidMount() {
        this.checkLogin()
    }

    checkLogin = () => {
        if (localStorage.getItem(AppString.ID)) {
            this.setState({isLoading: false}, () => {
                this.setState({isLoading: false})
                this.props.showToast(1, 'Login success')
                this.props.history.push('/main')
            })
        } else {
            this.setState({isLoading: false})
        }
    }

    onLoginPress = () => {
        this.setState({isLoading: true})
        myFirebase
            .auth()
            .signInWithPopup(this.provider)
            .then(async result => {
                let user = result.user
                if (user) {
                    const result = await myFirestore
                        .collection(AppString.NODE_USERS)
                        .where(AppString.ID, '==', user.uid)
                        .get()

                    if (result.docs.length === 0) {
                        // Set new data since this is a new user
                        myFirestore
                            .collection('users')
                            .doc(user.uid)
                            .set({
                                id: user.uid,
                                nickname: user.displayName,
                                aboutMe: '',
                                photoUrl: user.photoURL
                            })
                            .then(data => {
                                // Write user info to local
                                localStorage.setItem(AppString.ID, user.uid)
                                localStorage.setItem(AppString.NICKNAME, user.displayName)
                                localStorage.setItem(AppString.PHOTO_URL, user.photoURL)
                                this.setState({isLoading: false}, () => {
                                    this.props.showToast(1, 'Login success')
                                    this.props.history.push('/main')
                                })
                            })
                    } else {
                        // Write user info to local
                        localStorage.setItem(AppString.ID, result.docs[0].data().id)
                        localStorage.setItem(
                            AppString.NICKNAME,
                            result.docs[0].data().nickname
                        )
                        localStorage.setItem(
                            AppString.PHOTO_URL,
                            result.docs[0].data().photoUrl
                        )
                        this.setState({isLoading: false}, () => {
                            this.props.showToast(1, 'Login success')
                            this.props.history.push('/main')
                        })
                    }
                } else {
                    this.props.showToast(0, 'User info not available')
                }
            })
            .catch(err => {
                this.props.showToast(0, err.message)
                this.setState({isLoading: false})
            })
    }

    render() {
        return (
            <div className="viewRoot">
                <div className="header">React Chat</div>
                <button className="btnLogin" type="submit" onClick={this.onLoginPress}>
                    <img width="20px" style={{marginTop:"5px", marginRight:"8px"}} alt="Google sign-in" 
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/512px-Google_%22G%22_Logo.svg.png" />
                    <span>SIGN IN WITH GOOGLE</span>
                </button>

                {this.state.isLoading ? (
                    <div className="viewLoading">
                        <ReactLoading
                            type={'spin'}
                            color={'#203152'}
                            height={'3%'}
                            width={'3%'}
                        />
                    </div>
                ) : null}
            </div>
        )
    }
}

export default withRouter(Login)
