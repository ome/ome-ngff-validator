<script>
  import { getContext } from "svelte";
  import AboutDialog from "./Dialogs/AboutDialog.svelte";
  const { open } = getContext("simple-modal");
  const showAbout = () => open(AboutDialog);
  import omelogo from "/ome-main-nav.svg"
</script>


<a class="navLeft" href="./" aria-label="NGFF Validator home">

  <img style="height: 30px" alt="OME Logo" src="{omelogo}"/>

  <h1>NGFF Validator</h1>

</a>

<ul>
  <li>
    <button on:click={showAbout}>About</button>
  </li>
  <li>
    <a href="https://github.com/ome/ome-ngff-validator#faq">FAQ</a>
  </li>
</ul>

<style>
  .navLeft {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-left: 15px;
    color: white;
    text-decoration: none;
  }

  h1 {
    color: white;
    font-weight: 300;
    margin: 10px 15px;
  }

  ul {
    display: flex;
    align-items: center;
    list-style: none;
    color: white;
    position: fixed;
    right: 0;
    top: 0;
    margin: 10px 15px;
  }

  li {
    list-style-type: none;
  }

  button, a {
    display: inline-block;
    color: white;
    font-size: 18px;
    font-family: inherit;
    line-height: 1;
    margin: 3px;
    padding: 0;
    border: 0;
    background: none;
    cursor: pointer;
    text-decoration: none;
  }
</style>
