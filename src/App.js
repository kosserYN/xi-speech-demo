import React from 'react';
import axios from 'axios';
import "./App.css"
import AudioPane from "./AudioPane";
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import TextField from "@material-ui/core/TextField";
import LinearProgress from "@material-ui/core/LinearProgress"
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from '@material-ui/lab/Alert';
import Avatar from '@material-ui/core/Avatar';
import GitHubIcon from '@material-ui/icons/GitHub'

const TASK_CREATING_API = "https://xi-speech-synthesizer.herokuapp.com/task";
const PROGRESS_TRACKING_API = "https://xi-speech-synthesizer.herokuapp.com/progress";
const RESULT_RETRIEVING_API = "https://xi-speech-synthesizer.herokuapp.com/result";
const RESULT_DELETING_API = "https://xi-speech-synthesizer.herokuapp.com/result";

function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            text: "",
            audio: null,
            buttonDisabled: false,
            play: false,
            progress: null,
            requestStatus: {
                success: true,
                errorMessage: null
            },
            snackbarOpen: false,
            innerHeight: window.innerHeight,
            innerWidth: window.innerWidth,
            red: 0,
            green:0,
            blue: 0
        };
        this.textHasChanged = false;
        this.d_red = Math.random();
        this.d_green = Math.random();
        this.d_blue = Math.random();
        setInterval(() => {
            this.setState({
                red: this.state.red + this.d_red,
                green: this.state.green + this.d_green,
                blue: this.state.blue + this.d_blue,
                play: false
            }, () => {
                if (this.state.red <= 0 || this.state.red >= 50) {
                    this.d_red *= -1
                }
                if (this.state.green <= 0 || this.state.green >= 50) {
                    this.d_green *= -1
                }
                if (this.state.blue <= 0 || this.state.blue >= 50) {
                    this.d_blue *= -1
                }
            });
        }, 25)
    }


    componentDidMount() {
        window.addEventListener("resize", () => {
            this.setState({
                innerHeight: window.innerHeight,
                innerWidth: window.innerWidth,
                play: false
            })
        });
    }

    sendTask = () => {
        axios
            .post(TASK_CREATING_API, {
                text:this.state.text
            })
            .then(response => {
                const successful = response.data.request_successful;
                if (successful) {
                    setTimeout(this.checkProgress, 250, response.data.id);
                } else {
                    throw new Error(response.data.message)
                }
            })
            .catch(e => {
                this.setState({
                    audio: null,
                    play: false,
                    buttonDisabled: false,
                    progress: null,
                    requestStatus: {
                        success: false,
                        errorMessage: e.toString()
                    },
                    snackbarOpen: true,
                });
            });
    };

    checkProgress = (id) => {
        axios
            .get(PROGRESS_TRACKING_API + "?id=" + id)
            .then(response => {
                if (response.data.request_successful) {
                    const result = response.data.result;
                    this.setState({
                        progress: result.progress
                    });
                    if (result.finished) {
                        this.retrieveResult(id);
                    } else {
                        setTimeout(this.checkProgress, 500, id);
                    }
                } else {
                    throw new Error(response.data.message)
                }
            }).catch((e) => {
            this.setState({
                audio: null,
                play: false,
                buttonDisabled: false,
                progress: null,
                requestStatus: {
                    success: false,
                    errorMessage: e.toString()
                },
                snackbarOpen: true,
            })
        })
    };

    retrieveResult = (id) => {
        axios
            .get(RESULT_RETRIEVING_API + "?id=" + id)
            .then(response => {
                if (response.data.request_successful) {
                    const result = response.data.result;
                    this.setState({
                        audio: result.audio,
                        play: true,
                        buttonDisabled: false,
                        progress: null,
                        requestStatus: {
                            success: result.synthesis_successful,
                            errorMessage: result.message
                        },
                        snackbarOpen: true,
                    });
                    this.textHasChanged = false;
                    return axios.delete(RESULT_DELETING_API + "?id=" + id)
                } else {
                    throw new Error(response.data.message)
                }
            })
            .then(response => {
                if (!response.data.request_successful) {
                    throw new Error(response.data.message)
                }
            })
            .catch(e => {
                this.setState({
                    //audio: null,
                    play: false,
                    buttonDisabled: false,
                    progress: null,
                    requestStatus: {
                        success: false,
                        errorMessage: e.toString()
                    },
                    snackbarOpen: true,
                })
            })
    };

    handleSubmit = (event) => {
        event.preventDefault();
        if (this.textHasChanged) {
            this.setState({
                buttonDisabled: true,
                progress: 0
            });
            this.sendTask();
        } else {
            this.setState((prev) => ({
                play: true,
                snackbarOpen: true,
            }));
        }
    };

    handleChange = (event) => {
        this.setState({
            text: event.target.value,
            play: false,
            snackbarOpen: false,
        });
        this.textHasChanged = true;
    };

    handleClose = (event) => {
        this.setState({
            snackbarOpen: false,
            play: false,
        })
    };

    render() {
        let alertInfo = "";
        if (this.state.requestStatus.success) {
            if (this.state.requestStatus.errorMessage && this.state.requestStatus.errorMessage.length > 0) {
                const messages = this.state.requestStatus.errorMessage;
                const length = messages.length;
                const time = new Date().getTime();
                alertInfo = (
                    <Alert onClose={this.handleClose} severity="warning">
                        {messages.map((i, index) => (
                            <span key={time + "-" + index}>{i}{index !== length - 1 ? <br/> : ""}</span>
                        ))}
                    </Alert>
                )
            } else {
                alertInfo = (
                    <Alert onClose={this.handleClose} severity="success">
                        正在播放
                    </Alert>
                )
            }
        } else {
            alertInfo = (
                <Alert onClose={this.handleClose} severity="error">
                    {this.state.requestStatus.errorMessage}
                </Alert>
            )
        }
        const snackbar = <Snackbar open={this.state.snackbarOpen} autoHideDuration={6000} onClose={this.handleClose}>
            {alertInfo}
        </Snackbar>;
        const rgb = `rgb(${this.state.red},${this.state.green},${this.state.blue})`;
        return (
            <React.Fragment>
                <div id="filter" style={{backgroundColor: rgb}}/>
                <div id="content">
                    <Typography
                        variant={this.state.innerWidth < 650 ? "h4" : "h3"}
                        color="textPrimary"
                        style={{marginBottom: 24}}>
                        习近平讲话模拟器
                    </Typography>
                    <form onSubmit={this.handleSubmit}>
                        <TextField
                            id="text"
                            multiline
                            placeholder="请输入文本"
                            onChange={this.handleChange}
                            value={this.state.text}
                            rowsMax={Math.round(this.state.innerHeight / (this.state.innerHeight > 700 ? 40 : 70))}
                        />
                        <br/>
                        <Button
                            size="large"
                            id="button"
                            disabled={this.state.buttonDisabled}
                            type="submit"
                            style={{
                                margin: 24
                            }}
                            variant="outlined"
                        >
                            玉 音 放 送
                        </Button>
                    </form>
                    {this.state.progress != null ? <LinearProgress
                        variant={this.state.progress !== 1 && this.state.progress !== 0 ? "determinate" : "query"}
                        value={this.state.progress * 100}
                        style={{marginBottom: 24}}
                    /> : ""}
                    <AudioPane audio={this.state.audio} play={this.state.play}/>
                </div>
                {snackbar}
                <a href={"https://github.com/dnmkrgi/xi-speech-synthesizer"}>
                    <Avatar id={"about"}>
                        <GitHubIcon />
                    </Avatar>
                </a>
            </React.Fragment>
        );
    }
}

export default App;
