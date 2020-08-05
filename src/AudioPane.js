import React from "react";

export default class AudioPane extends React.Component {
    constructor(props) {
        super(props);
        this.audioPlayer = React.createRef();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.audioPlayer.current != null && this.props.play) {
            this.audioPlayer.current.pause();
            this.audioPlayer.current.load();
            this.audioPlayer.current.play();
        }
    }

    render() {
        const audioElement =
            <audio controls ref={this.audioPlayer}>
                <source src={"data:audio/mpeg;base64," + this.props.audio} type="audio/mpeg"/>
                Your browser does not support the audio element.
            </audio>;
        return(
            <div id="result">
                {this.props.audio == null ? "" : audioElement}
            </div>
        )
    }
}