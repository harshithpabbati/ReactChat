import React, {Component} from 'react'
import ReactLoading from 'react-loading'
import {withRouter} from 'react-router-dom'
import {myFirebase, myFirestore} from '../../config/MyFirebase'
import images from '../Themes/Images'
import WelcomeBoard from '../WelcomeBoard/WelcomeBoard'
import './Main.css'
import ChatBoard from '../ChatBoard/ChatBoard'
import {AppString} from '../Const'
import Sidebar from "react-sidebar";

const mql = window.matchMedia(`(min-width: 800px)`);

const styles = {
    contentHeaderMenuLink: {
        textDecoration: "none",
        color: "black",
    },
    content: {
        padding: "16px",
        height: "100%",
        backgroundColor: "white",
        minHeight: "100vh"
    },
    header: {
        backgroundColor: "#ffffff",
        color: "#000000",
        fontSize: "1.5em"
    }
};

class Main extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            isOpenDialogConfirmLogout: false,
            currentPeerUser: null,
            docked: mql.matches,
            open: false
        };
        this.currentUserId = localStorage.getItem(AppString.ID);
        this.currentUserAvatar = localStorage.getItem(AppString.PHOTO_URL);
        this.currentUserNickname = localStorage.getItem(AppString.NICKNAME);
        this.listUser = [];
        this.mediaQueryChanged = this.mediaQueryChanged.bind(this);
        this.toggleOpen = this.toggleOpen.bind(this);
        this.onSetOpen = this.onSetOpen.bind(this);
    }

    componentDidMount() {
        this.checkLogin()
    }

    componentWillMount() {
        mql.addListener(this.mediaQueryChanged);
    }

    componentWillUnmount() {
        mql.removeListener(this.mediaQueryChanged);
    }

    onSetOpen(open) {
        this.setState({ open });
    }

    mediaQueryChanged() {
        this.setState({
            docked: mql.matches,
            open: false
        });
    }

    toggleOpen() {
        this.setState({
            open: !this.state.open
        });
    }

    checkLogin = () => {
        if (!localStorage.getItem(AppString.ID)) {
            this.setState({isLoading: false}, () => {
                this.props.history.push('/');
            })
        } else {
            this.getListUser();
        }
    };

    getListUser = async () => {
        const result = await myFirestore.collection(AppString.NODE_USERS).get()
        if (result.docs.length > 0) {
            this.listUser = [...result.docs];
            this.setState({isLoading: false});
        }
    };

    onLogoutClick = () => {
        this.setState({
            currentPeerUser: null,
            isOpenDialogConfirmLogout: true,
            open: false,
        })
    };

    doLogout = () => {
        this.setState({isLoading: true});
        myFirebase
            .auth()
            .signOut()
            .then(() => {
                this.setState({isLoading: false}, () => {
                    localStorage.clear();
                    this.props.showToast(1, 'Logout success');
                    this.props.history.push('/');
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

    goToWelcome = () => {
        this.setState({
            currentPeerUser: null
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
                                this.setState({
                                    currentPeerUser: item.data(),
                                    open: false
                                })
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
                    </>
                )
            }
        });
        return viewListUser
    };

    render() {
        const contentHeader = (
            <span>
                {!this.state.docked && (
                    // eslint-disable-next-line jsx-a11y/anchor-is-valid
                    <a
                        onClick={this.toggleOpen}
                        href="#"
                        style={styles.contentHeaderMenuLink}
                    >
                        <img
                            className="icHamBurger"
                            alt="Hamburger icon"
                            src={images.ic_hamburger}
                        />
                    </a>
                )}
            </span>
        );

        const sidebar = (
            <>
                <div style={styles.header}>
                    <div className="row m-0 sticky-top ml-4">
                        {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
                        <img
                            className="rounded-circle"
                            src={this.currentUserAvatar}
                            width="100vw"
                            height="100vh"
                            alt={`${this.currentUserNickname}'s photo`}
                            onClick={this.goToWelcome}
                            style={{
                                top: 0,
                                marginTop: "20px"
                            }}
                        />
                    </div>
                </div>
                <div style={styles.content} className="sidebar">
                    <hr />
                    {this.renderListUser()}
                    <div className="footer">
                        <hr />
                        <button
                            key="logout"
                            className={`viewWrapItem`}
                            onClick={this.onLogoutClick}
                            style={{cursor: "pointer"}}
                        >
                            <img
                                className="viewAvatarItem"
                                alt="An icon logout"
                                src={images.ic_logout}
                            />
                            <div className="viewWrapContentItem">
                                <span className="textItem">
                                    <b>Logout</b>
                                </span>
                            </div>
                        </button>
                    </div>
                </div>
            </>
        );

        const sidebarProps = {
            sidebar,
            sidebarClassName: "sideBar",
            docked: this.state.docked,
            open: this.state.open,
            onSetOpen: this.onSetOpen
        };

        return (
            <div className="root">
                <div className="row m-0">
                    <Sidebar {...sidebarProps}>
                        <div className="body">
                            <div className="viewBoard">
                                {this.state.currentPeerUser ? (
                                    <ChatBoard
                                        title={contentHeader}
                                        currentPeerUser={this.state.currentPeerUser}
                                        showToast={this.props.showToast}
                                    />
                                ) : (
                                    <WelcomeBoard
                                        title={contentHeader}
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
                    </Sidebar>
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
