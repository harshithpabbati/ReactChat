import React, {Component} from 'react'
import ReactLoading from 'react-loading'
import {withRouter} from 'react-router-dom'
import {myFirebase, myFirestore} from '../../config/MyFirebase'
import images from '../Themes/Images'
import WelcomeBoard from '../WelcomeBoard/WelcomeBoard'
import './Main.css'
import ChatBoard from '../ChatBoard/ChatBoard'
import {AppString} from '../Const'

class Main extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            isOpenDialogConfirmLogout: false,
            currentPeerUser: null
        };
        this.currentUserId = localStorage.getItem(AppString.ID)
        this.currentUserAvatar = localStorage.getItem(AppString.PHOTO_URL)
        this.currentUserNickname = localStorage.getItem(AppString.NICKNAME)
        this.listUser = []
    }

    componentDidMount() {
        this.checkLogin()
    }

    checkLogin = () => {
        if (!localStorage.getItem(AppString.ID)) {
            this.setState({isLoading: false}, () => {
                this.props.history.push('/')
            })
        } else {
            this.getListUser()
        }
    };

    getListUser = async () => {
        const result = await myFirestore.collection(AppString.NODE_USERS).get()
        if (result.docs.length > 0) {
            this.listUser = [...result.docs]
            this.setState({isLoading: false})
        }
    }

    onLogoutClick = () => {
        this.setState({
            isOpenDialogConfirmLogout: true
        })
    }

    doLogout = () => {
        this.setState({isLoading: true})
        myFirebase
            .auth()
            .signOut()
            .then(() => {
                this.setState({isLoading: false}, () => {
                    localStorage.clear()
                    this.props.showToast(1, 'Logout success')
                    this.props.history.push('/')
                })
            })
            .catch(function (err) {
                this.setState({isLoading: false});
                this.props.showToast(0, err.message)
            })
    };

    hideDialogConfirmLogout = () => {
        this.setState({
            isOpenDialogConfirmLogout: false
        })
    };

    renderListUser = () => {
        let viewListUser = [];
        this.listUser.forEach((item, index) => {
            if (item.data().id !== this.currentUserId) {
                viewListUser.push(
                    <>
                        <button
                            key={index}
                            className={
                                this.state.currentPeerUser &&
                                this.state.currentPeerUser.id === item.data().id
                                    ? 'viewWrapItemFocused'
                                    : 'viewWrapItem'
                            }
                            onClick={() => {
                                this.setState({currentPeerUser: item.data()})
                            }}
                            style={{cursor: "pointer"}}
                        >
                            <img
                                className="viewAvatarItem"
                                src={item.data().photoUrl}
                                alt="icon avatar"
                            />
                            <div className="viewWrapContentItem">
                                    <span className="textItem">
                                        <b>{item.data().nickname}</b>
                                    </span>
                            </div>
                        </button>
                        <hr />
                    </>
                )
            }
        });
        return viewListUser
    };

    render() {
        return (
            <div className="root">
                <div className="row m-0">
                    <div className="col-md-3">
                        <div className="viewListUser pr-2">
                            <div className="row m-0 sticky-top">
                                <div className="col-md-2">
                                    {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
                                    <img
                                        className="rounded-circle"
                                        src={this.currentUserAvatar}
                                        width="40vw"
                                        height="40vh"
                                        alt={`${this.currentUserNickname}'s photo`}
                                    />
                                </div>
                                <div className="col-md-8" />
                                <div className="col-md-2">
                                    <img
                                        className="icLogout"
                                        alt="An icon logout"
                                        src={images.ic_logout}
                                        onClick={this.onLogoutClick}
                                    />
                                </div>
                            </div>
                            <hr />
                            {this.renderListUser()}
                        </div>
                    </div>
                    <div className="col-md-9">
                        <div className="body">
                            <div className="viewBoard">
                                {this.state.currentPeerUser ? (
                                    <ChatBoard
                                        currentPeerUser={this.state.currentPeerUser}
                                        showToast={this.props.showToast}
                                    />
                                ) : (
                                    <WelcomeBoard
                                        currentUserNickname={this.currentUserNickname}
                                        currentUserAvatar={this.currentUserAvatar}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Dialog confirm */}
                        {this.state.isOpenDialogConfirmLogout ? (
                            <div className="viewCoverScreen">
                                {this.renderDialogConfirmLogout()}
                            </div>
                        ) : null}

                        {/* Loading */}
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
                </div>
            </div>
        )
    }

    renderDialogConfirmLogout = () => {
        return (
            <div>
                <div className="viewWrapTextDialogConfirmLogout">
                    <span className="titleDialogConfirmLogout">Are you sure to logout?</span>
                </div>
                <div className="viewWrapButtonDialogConfirmLogout">
                    <button className="btnYes" onClick={this.doLogout}>
                        YES
                    </button>
                    <button className="btnNo" onClick={this.hideDialogConfirmLogout}>
                        CANCEL
                    </button>
                </div>
            </div>
        )
    }
}

export default withRouter(Main)
