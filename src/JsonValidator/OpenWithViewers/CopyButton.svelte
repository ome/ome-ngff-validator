<script>
  import copy_icon from "/copy_icon.png";

  export let copy_text;
  export let button_logo;
  export let title;

  let shaking = false;

  function copyTextToClipboard(event) {
    console.log("copyTextToClipboard...", event.target);
    const textArea = document.createElement("textarea");
    // Place in the top-left corner of screen regardless of scroll position.
    textArea.style.position = "fixed";

    textArea.value = copy_text;

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    let successful;
    try {
      successful = document.execCommand("copy");
    } catch (err) {
      console.log("Oops, unable to copy");
    }
    document.body.removeChild(textArea);

    if (successful) {
      shaking = true;
      // show user that copying happened
      setTimeout(() => {
        // reset after 1 second
        shaking = false;
      }, 1000);
    } else {
      console.log("Copying failed");
    }
  }
</script>

<button class="copyBtn" {title} on:click={copyTextToClipboard}>
  <img class="viewer_icon" src={button_logo} alt="Viewer Icon" />
  <img class="copyIcon" class:shaking="{shaking}" src={copy_icon} alt="Copy Icon" />
</button>

<style>

  @-webkit-keyframes seesaw {
    from {
      transform: rotate(-0.05turn);
    }
    to {
      transform: rotate(0.05turn);
    }
  }
  @keyframes seesaw {
    from {
      transform: rotate(-0.05turn);
    }
    to {
      transform: rotate(0.05turn);
    }
  }

  .copyBtn {
    position: relative;
  }

  :global(.shaking) {
    animation: 0.1s linear 0s infinite alternate seesaw;
  }

  .copyIcon {
    position: absolute;
    top: 4px;
    left: 4px;
    visibility: hidden;
    border-radius: 3px;
    /* width: 18px; */
    height: 21px;
  }

  .copyBtn:hover .copyIcon {
    visibility: visible;
  }

  .viewer_icon {
      max-height: 32px;
      max-width: 32px;
      margin: 2px;
      border-radius: 5px;
      vertical-align: middle;
    }

</style>
