// playerStates.js
const states = {
    STAYING: 0,
    RUNNING: 1,
}; 

class State {
    constructor(state) {
        this.state = state;    
    }
} 

export class Staying extends State {
    constructor(player) {
        super('STAYING');
        this.player = player;
    }

    enter(){
        this.player.frameX = 0;
        this.player.frameY = 0;
        this.player.maxFrame = 9;   
    }

    handleInput(input){
        if (input.includes('ArrowLeft') || input.includes('ArrowRight')){
            this.player.setState(states.RUNNING);
        }
    }
} 

export class Running extends State {
    constructor(player) {
        super('RUNNING');
        this.player = player;
    }

    enter(){
        this.player.frameX = 0;
        this.player.frameY = 1;
        this.player.maxFrame = 9;   
    }

    handleInput(input){
        const noHorizontalInput =
            !input.includes('ArrowLeft') &&
            !input.includes('ArrowRight');

        if (noHorizontalInput) {
            this.player.setState(states.STAYING);
        }
    }
}
