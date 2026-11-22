// The coin pictures (gold / silver / bronze), used on the printed sheets and in the player's camera view.
const coinImg = (tier) => `<img class="coin coin-${tier}" src="/coins/${tier}.png" alt="">`;
const BOMB_SHAPES = ['classic', 'dynamite', 'grenade', 'mine']; // the 4 bomb pictures
const bombImg = (i) => `<img class="bomb" src="/bombs/${BOMB_SHAPES[i]}.png" alt="">`;
