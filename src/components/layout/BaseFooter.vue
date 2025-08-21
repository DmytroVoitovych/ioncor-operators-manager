<template>
  <footer>
    <p className="text-preset-8">
      Made with ❤️ and ☕️
      <a
        class="footer__items--ref"
        href="https://portfolio-dmytrovoitovych.vercel.app/"
        target="_blank"
        rel="noopener noreferrer"
        >by Voitovych</a
      >
    </p>
  </footer>
</template>
<style lang="scss" scoped>
footer {
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  padding: 16px 20px;

  .footer__items--ref {
    display: inline-block;
    color: inherit;
    text-decoration: underline;
    cursor: pointer;

    -webkit-animation: mymove 3s infinite;
    /* Safari 4.0 - 8.0 */
    animation: mymove 3s infinite;

    /* Safari 4.0 - 8.0 */
    @-webkit-keyframes mymove {
      30% {
        box-shadow: 0px 15px 15px rgba(255, 170, 114, 1);
      }
    }

    @keyframes mymove {
      30% {
        box-shadow: 0px 15px 15px rgba(255, 170, 114, 1);
      }
    }
  }
}
</style>
