<script>
  import { getContext } from "svelte";
  import AboutDialog from "./Dialogs/AboutDialog.svelte";
  const { open } = getContext("simple-modal");
  const showAbout = () => open(AboutDialog);
  import omelogo from "/ome-main-nav.svg"
</script>


<div class="navLeft">

  <img style="height: 30px" alt="OME Logo" src="{omelogo}"/>

  <h1>NGFF Validator</h1>

</div>

<ul>
  <li>
    <button on:click={showAbout}>About</button>
  </li>
</ul>

<style>
  .navLeft {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-left: 15px;
  }

  h1 {
    color: white;
    font-weight: 300;
    margin: 10px 15px;
  }

  ul {
    list-style: none;
    color: white;
    position: fixed;
    right: 0;
    top: 0;
    margin: 10px 15px;
  }

  li {
    float: right;
    list-style-type: none;
  }

  button {
    color: white;
    font-size: 18px;
    margin: 3px;
  }
</style>
