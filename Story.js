export default class Story {
    constructor(dispatcher) {

        this.dispatcher = dispatcher;

        this.story = [
            {
                windowIndex: 77,
                gender: null,
                nationality: null,
                job: "",
                state: null,
                text: "Austria's unemployment seems stable. The overall number of unemployed people periodically rises in the winter months, and falls in the summer months. The overall trend is going upwards only slightly, but the number of months spent unemployed is rising."
            },
            {
                windowIndex: 15,
                gender: null,
                nationality: null,
                job: "",
                state: null,
                text: "The biggest spike in recent years was due to the Covid-19 pandemic."
            },
            {
              windowIndex: 0,
              gender: null,
              nationality: null,
              job: "",
              state: null,
              text: "The pre-pandemic number of months spent unemployed on average was 3.5."
            },
            {
                windowIndex: 28,
                gender: null,
                nationality: null,
                job: "",
                state: null,
                text: "After Covid-19, that value is reached again by April 2022, so we assume that the adverse effects from the pandemic are over at that point."
            },
            {
                windowIndex: 28,
                gender: null,
                nationality: "Inländer_innen",
                job: "647",
                state: null,
                text: "Let's look at a specific demographic: Austrian citizens that work in IT. The months spent unemployed are a bit higher than average (4.3 compared to 3.7), but not much."
            },
            {
                windowIndex: 35,
                gender: null,
                nationality: "Inländer_innen",
                job: "647",
                state: null,
                text: "These are the values for November 2022, the time around which ChatGPT was introduced. Average months unemployed in IT Jobs were 3.9, whe the general value was 3.4 months. Does AI have an impact on unemployment?"
            },
            {
                windowIndex: 77,
                gender: null,
                nationality: "Inländer_innen",
                job: "647",
                state: null,
                text: "In the present, the number of unemployed months for citizens in IT jobs has risen to 5 (1.1 month increase), while the national average has only climbed to 4 (0.6 month increase). Unemployment in this field seems to rise more quickly, which may be due to the rise of mainstream AI."
            },
            {
                windowIndex: 35,
                gender: null,
                nationality: "Inländer_innen",
                job: "647",
                state: null,
                text: "To find out, if any regions are affected more than others, we have to look at the data from November 2022 again. Look at the map when the date changes to the current one."
            },
            {
                windowIndex: 77,
                gender: null,
                nationality: "Inländer_innen",
                job: "647",
                state: null,
                text: "As you can see, all federal states of Austria got darker. Burgenland has the largest difference (1.3 months), but Vienna has the highest absolute value with 5.8 months. Finding a job in a place with many people seems to take longer. Salzburg and Vorarlberg had the smallest jumps (0.7 month increase)."
            },
            {
                windowIndex: 77,
                gender: null,
                nationality: "Inländer_innen",
                job: "647",
                state: null,
                text: "So the main pattern is not just rising unemployment, but rising time spent unemployed. In Austria's IT sector, this increase is stronger than in the national average, which might be due to the rise of LLMs."
            },
            {
                windowIndex: 77,
                gender: null,
                nationality: null,
                job: "",
                state: null,
                text: "Can you find any interesting patterns?"
            },

        ];
    }

    initStory(){
        this.storyIndex = 0;
        this.printStory();
    }

    nextStory(){
        this.storyIndex++;
        this.printStory()
    }

    prevStory(){
        this.storyIndex--;
        this.printStory();
    }

    printStory(){
        const currentStory = this.story[this.storyIndex];

        if(this.storyIndex === 0){
            document.getElementById("back").disabled = true;
        }else{
            document.getElementById("back").disabled = false;
        }

        if(this.storyIndex === this.story.length-1){
            document.getElementById("forward").disabled = true;
        }else{
            document.getElementById("forward").disabled = false;
        }

        document.getElementById("storyText").innerHTML = currentStory.text;

        this.dispatcher.call("storyUpdate", null, currentStory);
    }
}