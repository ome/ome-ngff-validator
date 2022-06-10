<script>
    import { getJson, validate } from "./utils";
  
    export let wellAttrs;
    export let source;
    export let path;

  
    async function loadAndValidate() {
        console.log("wellAttrs", wellAttrs, wellAttrs.well);
        let imgPath = wellAttrs.well.images[0].path;
        let imgAttrs = await getJson(source + path + "/" + imgPath + "/.zattrs");
        let errs = await validate(imgAttrs);
        return errs;
    }

    let validatePromise = validate(wellAttrs);

    let imagePromise = loadAndValidate();

  </script>
      
  {#await validatePromise}
    <td>...</td>
  {:then errors}
    <td class="{errors.length === 0 ? "valid" : "invalid"}">
        {#await imagePromise}
            &nbsp
        {:then imgErrors}
            {imgErrors.length === 0 ? "✓" : "⨯"}
        {/await}
    </td>
  {:catch error}
    <td style="color: red">{error.message}</td>
  {/await}

<style>
    td {
        width: 20px;
        height: 20px;
    }
    td.valid {
        background-color: #eeffee;
    }
    td.invalid {
        background-color: #ffeeee;
    }
</style>
