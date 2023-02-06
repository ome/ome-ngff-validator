<script>
    import viewers_json from "../../public/ngff_viewers.json"
    
    // import vizarrLogoUrl from "../assets/vizarr_logo.png"

    export let source;
    export let dtype;

    // console.log("viewers_json.logo", viewers_json.logo);

    // import assets_dir from "/xxx.png";

    console.log({source});

    let viewers = viewers_json.viewers.map((viewer_data) => {
      let href = viewer_data.href;
      if (href.includes("{URL}")) {
        href = href.replace("{URL}", source);
      } else {
        href += source;
      }
      return {...viewer_data, href}
    });

  </script>

    <p>Open with:   

    {#each viewers as viewer}
        
        
        <a title="View {dtype} in {viewer.name}" target="_blank"
      href="{viewer.href}"
      >
      <img class="viewer_icon" alt="Vizarr logo" src={viewer.logo}/></a>
    
      {/each}
    
    </p>


  
  <style>
    a,
    a:visited {
      color: #ff512f;
    }
    .json {
      text-align: left;
      margin-top: 10px;
      color: #faebd7;
      background-color: #263749;
      padding: 10px;
      font-size: 14px;
      border-radius: 10px;
      font-family: monospace;
    }
  
    .viewer_icon {
      max-height: 32px;
      max-width: 32px;
      margin: 2px;
      border-radius: 5px;
      vertical-align: middle;
    }
  </style>
  