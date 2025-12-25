# Project:

I need to implement web app called Spark Deck.
It is a game for two people based on deck of cards.
It should be lightweight app that uses static only data.

# Game flow & features:

Each card belongs to a category and has a text assosiated with it.

The home page will ask for names of the players to use and selection of available decks.

Each deck can have color scheme and maybe font assigned to it to use in later buttons/text to control the look and the mood.

After players named and deck is selected
we got to categories screen: 4 categories drawn randomly from the deck and displayed as clickable buttons arranged in a 2x2 grid.

Player1 selects first category, random card that belongs to this category shown on the screen for Player 2 to play this card (often answering the question shown).

After question answered, Player 2 selects the category for Player one to play next card.
So the game continues like that.

And so game play: order of players, question page and so on can be different based on the game mode.

1. Keep and display current player.
2. Next player function should chnage current player.
3. Keep log of user actions: 
player 1: category X 
player 2: question abc
player 2: category Y
player 1: question ghf
4. Copy deck in once game started and delete already shown questions from it so it is impossible to show same question twice.
5. Keep track of categories: if category is empty (no questions left) on the category scree it should be grey but still can be shown but is not cliackable anymore.
6. 4 categories drawn randomly from all the categories known in the begginging.
7. if all 4 categories drawn randomly are empty - it is the first winning condition and you can show buttons "continue" and "stop here".
8. when we press "stop here" we should show end game page.
9. end game page should have some text and option to send transcript to the provided email.
maybe later we can come up with stats to show.

# Implementaton:

I am using Next.js and minimal dependecies.

Styling:
Css modules only for styling.
My target is mobile views, but nice if it still works on laptop.

Decks are bundled as static json files.
Persistance: session only.

Use footer for author message shown always.

# Screens:

Landing page:

- greeting (text)
- 2 Edit boxes: for player names (use Me and You as default)
- Select a deck (text)
- decks "buttons":
selected deck highlighed and description shown
- deck description (text)
- button Start Game

Category page:

- {Current player} : select category (text)
- Questions answered so far: {counter}
- 2x2 category tiles/buttons
- descreet button to Stop Now

Card page:
- {Category} (text)
- Turn: {Current Player}
- Box with Question
- Button Your Turn
- descreet button to Stop Now

First Winning condition page:
- You have completed all 4 drawn categories!
- Total questions answered {answered quesiton}/{total questions}
- button Continue Anyway
- descreet button to Stop Now

Final page:
- You answered all questions!
- descreet button to Stop Now

Stop page:
- show players stats

# Game logic:

one active current player.
current player changed when category is selected.
category selected by clicking on Categories tile.
Every time question answered - it removed from the deck.
Once category have no questions left it still can be drawn.
Category with no questions left is grey and non clickable.







