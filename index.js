const Vue = require('vue/dist/vue');
import $ from 'jquery/dist/jquery.slim';
import 'popper.js';
import 'bootstrap';
import {searchSuggestions} from './scripts/getSuggestions';

new Vue({
    el: '#search',
    data: {
        searchText: '', //The actual search in the search box
        suggestions: [], //List of all suggestions
        fetchingSuggestions: false, //Keeps track of app state
        selectedSuggestionIndx: -1, //Keeps track of selected suggestion
    },
    computed: {
        lastWord: function()    {
            /**
             * Dynamically keeps computing last word as user keeps typing ahead
             */
            return this.searchText.trim().split(' ').splice(-1)[0];
        }
    },
    methods: {
        showSuggestions: function()    {
            /**
             * The primary script calling the suggestion utility and
             * populating suggestion array based on the resoluted response
             */
            var that = this;
            that.fetchingSuggestions = true;
            searchSuggestions.getSuggestions(this.lastWord)
                .then(suggestions => {
                    that.suggestions = suggestions;
                })
                .catch(error => {
                    console.info('No suggestions for', that.lastWord);
                })
                .finally(() =>{
                    that.fetchingSuggestions = false;
                    that.selectedSuggestionIndx = -1;
                });
        },
        searchTextTyped: function(event) {
            /**
             * Called on typeahead interaction from user;
             * calling suggestion after verifying the event arises from keyboard
             */
            if(!event.code.startsWith('Key'))   {
                return;
            }
            this.showSuggestions();
        },
        textDeleted: function(event)    {
           /**
            * Handles the use case of backspace on text box
            */
            if(this.searchText === '')  {
                this.suggestions = [];
                return;
            }
            this.showSuggestions();
        },
        selectingDown: function(event)  {
            /**
            * Ensures user can interact and choose suggestions
            * down arrown in keyboard
            */
            this.selectedSuggestionIndx = (
                this.selectedSuggestionIndx + 1
            ) % this.suggestions.length;
        },
        selectingUp: function(event)    {
            /**
            * Ensures user can interact and choose suggestions
            * up arrown in keyboard
            */
            if(this.selectedSuggestionIndx < 1)   {
                this.selectedSuggestionIndx = this.suggestions.length-1;
            }
            else {
                this.selectedSuggestionIndx-=1;
            }
        },
        selectingClick: function(event) {
            /**
             * Ensures user can click a suggestion from list and activates it
             */
            var selectedIndex = $(event.target).index()-1;
            if(selectedIndex >= 0 && selectedIndex < this.suggestions.length)   {
                this.selectedSuggestionIndx = selectedIndex;
                this.bringSelectedSuggestion(event);
                document.querySelector('.search-with-suggestion input').focus();
            }
        },
        isActive: function(index)   {
            /**
             * Helps in user navigating through suggestions by highlighting
             * as user moves through them using Up/Down buttons
             */
            if(index === this.selectedSuggestionIndx)   {
                return 'active';
            }
            else {
                return '';
            }
        },
        bringSelectedSuggestion: function(event) {
            /**
             * The choses suggestion is activates;
             * thereby replacing the last word with chosen suggestion
             */
            if(this.selectedSuggestionIndx < 0 ||
                    this.selectedSuggestionIndx >= this.suggestions.length)    {
                return;
            }
            var newText = this.searchText.trim().split(' ').slice(0, -1);
            newText.push(this.suggestions[this.selectedSuggestionIndx]);
            this.searchText = newText.join(' ') + ' ';
            this.suggestions = [];
        },
        clickOutside: function(event)   {
            /**
             * Handles the use case of clicking outside hides suggestion box
             */
            this.suggestions = [];
        }
    }
});
