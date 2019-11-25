---
layout: post
title:  "JSON keys camel case to snake case conversion"
date:   2019-10-24 14:29:35 +0300
categories: [programming]
thumbnail: /assets/posts_pics/json_camel_to_snake.png
tags: [javascript, programming, algorithms, json, camel case, snake case, parsing]
lang: en
ref: json_camel_to_snake
---

![cover]

The reason to solve this task was the need for me to keep two applications with different JSON 
key naming conventions to work together while keeping those conventions each to its own. 
Perhaps it's my fault, but I wasn't able to find any ready solution that could perfectly fit for 
the task as I see it, neither for the browser nor backend app. 

It is an example in three steps, following the evolution of thought and the code as well.

First of all, I decided to do this conversion on the front-end side so that we use JavaScript further down.

Second, I shrug off the possibility to do that after the JSON parsed and decided to tamper with it 
while it is in a serialized string state. My reasons were simple - CPU time and memory efficiency. 
Recursively running through the deeply nested objects while renaming and replacing its keys 
(and values as well) is quite costly in JavaScript. *The statement above is not valid today* since
they optimized Tail Call and JSON parse/stringify operations. The last ones cost almost zero, even for moderately large and deeply nested JSONs. So beware. And it also could be the topic for
my next post.

Ok, let's get to the solution. First thing that came into my head is just to do the following:
- run through the string,
- look for any upper case character,
- if any found, replace it with a string consists of underscore `_` and the same character but in lower case.

Let's say it would be our JSON to tamper with:
```json
{
  "firstName": "Jay",
  "lastName": "Rogers",
  "items": [
    "pistol",
    {
      "digitKey": 54,
      "itemName": "pocketPistol",
      "quality": "quite normal"
    }
  ]
}
```
and the function would be as follows:
```javascript
function JSONToSnake(input) {
  let snakeStr = '';

  for (let i = 0; i < input.length; i++) {
  	const letter = input[i];
	if (/[A-Z]/.test(letter)) {
    	snakeStr += '_' + letter.toLowerCase()
    } else {
      snakeStr += letter
    }
  }
  return snakeStr;
}
```

Looks easy, right? Just one iteration, with single check if we have an uppercase character.
But there is a catch, lets see the result of running the function above against our JSON.

```json
{
  "first_name": "_jay",
  "last_name": "_rogers",
  "items": [
    "pistol",
    {
      "digit_key": 54,
      "item_name": "pocket_pistol",
      "quality": "quite normal"
    }
  ]
}
```

We need to be able to know where we stand on each iteration of our cycle to know if the current letter is a part of a key or a value?
Also, remember that we need to transform only key's names, so we better narrow our search to keys. 
JSON key always ends with `":` combination and starts with `{"` or `,"`. So, we would need to do the following: 
- check if two previous symbols are one of the three combinations
- determine if the key name is begun or ended
- JSON could be formatted, like ours, so we need to take a blind eye on spaces and line breaks. But even better - we could make any comparison only if we stumble upon one of the 
service symbol, the part of JSON syntax.

For this task would be best to accumulate those symbols in a particular variable outside of the scope of the cycle and change it only if we encounter any other syntactic symbol.

Now, here is the function for that:

```javascript
function JSONCamelToSnake(input) {
  if (typeof input !== 'string') throw new Error('input must be a string');
  let snakeStr = '';
  let isKeyStarted = false;
  let isKeyEnded = true;
  let first = '';
  let second = '';
  for (let i = 0; i < input.length; i++) {
  	const prevSymb = input[i - 1];
    const isFormatting = /[":,[\]}{]/.test(prevSymb);
    // accumulate last two syntactic symbols we encountered
    if (isFormatting) {
    	if (second && second !== first) first = second;
    	second = prevSymb
    }
    // getting previous two of those symbols
    const prevTwo = first + second;
    if (!isKeyStarted) { // if key name is not here
      // checking if key name was started
      isKeyStarted = prevTwo === '{"' || prevTwo === ',"';
      // switching isKeyEnded flag accordingly
      isKeyEnded = !isKeyStarted
    } else {
      // if key name is started, we need to know when it ended
      isKeyEnded = prevTwo === '":';
      // switching isKeyStarted flag accordingly
      isKeyStarted = !isKeyEnded
    }
    // The last block is for doing actual transformation,
    // which will be performed only against key names and
    // letters in upper case
    if (isKeyStarted && /[A-Z]/.test(input[i])) {
      snakeStr = snakeStr + '_' + input[i].toLowerCase()
    } else {
      snakeStr = snakeStr + input[i]
    }
  }
  return snakeStr;
}
```

Now we should get correct results... Let's see

```json
{
  "first_name": "Jay",
  "last_name": "Rogers",
  "items": [
    "pistol",
    {
      "digit_key": 54,
      "item_name": "pocketPistol",
      "quality": "quite normal"
    }
  ]
}
```

You could see for the result and a working example down the [JSFiddle link](https://jsfiddle.net/horlet/69eLvb5r/)

[cover]: /assets/posts_pics/json_camel_to_snake.png