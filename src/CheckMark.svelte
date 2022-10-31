<script>
  export let valid;
</script>

{#if valid}
  <div class="valid">✓</div>
{:else}
  <div class="invalid">×</div>
{/if}

<style>
  .invalid,
  .valid {
    border-radius: 50%;
    padding: 10px;
    margin: 10px auto;
    color: white;
    width: 100px;
    height: 100px;
    font-size: 50px;
    text-align: center;
    padding: 15px;
  }
  .invalid {
    background-color: red;
    border: solid red 1px;
  }

  .valid {
    background-color: green;
    border: solid green 1px;
  }
</style>
