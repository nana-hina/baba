class Card {
    constructor(suit, rank) {
      this.suit = suit; // ハート, ダイヤ, クラブ, スペード, or Joker
      this.rank = rank; // 1〜13 or 'Joker'
    }
    toString() {
      if (this.suit === "Joker") return "Joker";
      const ranks = [null, "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
      return `${ranks[this.rank]}${this.suit[0]}`;
    }
  }
  
  class Player {
    constructor(name, isHuman = false) {
      this.name = name;
      this.isHuman = isHuman;
      this.hand = [];
    }
    showHand() {
      if (this.isHuman) {
        return this.hand.map((c, i) => `${i + 1}:${c.toString()}`).join(", ");
      } else {
        return `(${this.hand.length}枚)`;
      }
    }
    removePairs() {
      // ランクごとにグループ化し、ペアを除去する
      const count = {};
      for (const card of this.hand) {
        count[card.rank] = (count[card.rank] || 0) + 1;
      }
      // ペアの数を計算
      const toRemoveRanks = [];
      for (const rank in count) {
        if (count[rank] >= 2) {
          const pairs = Math.floor(count[rank] / 2);
          for (let i = 0; i < pairs * 2; i++) {
            toRemoveRanks.push(rank);
          }
        }
      }
      // ペアのカードを手札から除去
      for (const rank of toRemoveRanks) {
        const idx = this.hand.findIndex(c => c.rank == rank);
        if (idx !== -1) this.hand.splice(idx, 1);
      }
    }
    drawCardFrom(player, idx = null) {
      // idxは人間用。CPUはランダムに引く
      if (idx === null) {
        idx = Math.floor(Math.random() * player.hand.length);
      }
      const card = player.hand.splice(idx, 1)[0];
      this.hand.push(card);
      return card;
    }
    hasJoker() {
      return this.hand.some(c => c.suit === "Joker");
    }
    handIsEmpty() {
      return this.hand.length === 0;
    }
  }
  
  class OldMaidGame {
    constructor() {
      this.players = [
        new Player("あなた", true),
        new Player("CPU1"),
        new Player("CPU2"),
        new Player("CPU3"),
      ];
      this.currentPlayerIndex = 0;
      this.isGameOver = false;
    }
  
    createDeck() {
      const suits = ["Hearts", "Diamonds", "Clubs", "Spades"];
      const deck = [];
      for (const suit of suits) {
        for (let rank = 1; rank <= 13; rank++) {
          deck.push(new Card(suit, rank));
        }
      }
      deck.push(new Card("Joker", "Joker")); // ババはジョーカー1枚
      return deck;
    }
  
    shuffle(deck) {
      for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
      }
    }
  
    deal() {
      const deck = this.createDeck();
      this.shuffle(deck);
  
      // 4人に順に配る
      let idx = 0;
      while (deck.length) {
        this.players[idx % 4].hand.push(deck.pop());
        idx++;
      }
      // 各プレイヤーのペア除去
      for (const player of this.players) {
        player.removePairs();
      }
    }
  
    nextPlayerIndex(i) {
      return (i + 1) % this.players.length;
    }
  
    showHands() {
      for (const p of this.players) {
        console.log(`${p.name}: ${p.showHand()}`);
      }
    }
  
    async playerTurn(player) {
      console.log(`\n--- ${player.name} のターン ---`);
  
      const nextPlayer = this.players[this.nextPlayerIndex(this.currentPlayerIndex)];
  
      if (player.isHuman) {
        console.log(`あなたの手札: ${player.showHand()}`);
        console.log(`${nextPlayer.name}のカードは ${nextPlayer.hand.length} 枚あります。`);
  
        let choice;
        while (true) {
          choice = prompt(`0から${nextPlayer.hand.length - 1}の数字を入力して、${nextPlayer.name}のカードを引いてください（左から0番目）:`);
          if (choice === null) {
            console.log("ゲームを中断しました。");
            this.isGameOver = true;
            return;
          }
          choice = parseInt(choice);
          if (!isNaN(choice) && choice >= 0 && choice < nextPlayer.hand.length) break;
          console.log("正しい数字を入力してください。");
        }
  
        const card = player.drawCardFrom(nextPlayer, choice);
        console.log(`引いたカードは ${card.toString()} です。`);
      } else {
        // CPUはランダムに引く
        const card = player.drawCardFrom(nextPlayer);
        console.log(`${player.name}は${nextPlayer.name}からカードを1枚引いた。`);
      }
  
      player.removePairs();
  
      // 手札が空なら勝ち抜け
      if (player.handIsEmpty()) {
        console.log(`${player.name}は手札がなくなり勝ち抜けました！`);
        this.players.splice(this.currentPlayerIndex, 1);
        if (this.currentPlayerIndex >= this.players.length) {
          this.currentPlayerIndex = 0;
        }
        return;
      }
  
      // ババ持ちが一人だけならゲーム終了
      const jokerHolders = this.players.filter(p => p.hasJoker());
      if (jokerHolders.length === 1 && this.players.length === 2) {
        console.log(`ゲーム終了！ ババを持っているのは ${jokerHolders[0].name} です。負けです！`);
        this.isGameOver = true;
      }
    }
  
    async start() {
      console.log("ババ抜きゲーム開始！");
      this.deal();
  
      while (!this.isGameOver && this.players.length > 1) {
        this.showHands();
        const player = this.players[this.currentPlayerIndex];
        await this.playerTurn(player);
        if (this.isGameOver) break;
        this.currentPlayerIndex = this.nextPlayerIndex(this.currentPlayerIndex);
      }
  
      if (!this.isGameOver) {
        console.log("ゲーム終了！ ババを持っているプレイヤーが決まりました。");
      }
    }
  }
  
  // 実行例（ブラウザのコンソールで動かしてください）
  const game = new OldMaidGame();
  game.start();
  