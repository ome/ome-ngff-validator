
<script>
  import { getJson } from "../../utils";

    export let jsonData;

    // Try to find various fields in the Ro-Crate metadata
    let license = jsonData["@graph"].find(item => item["license"])?.license;
    let name = jsonData["@graph"].find(item => item["name"])?.name;
    let description = jsonData["@graph"].find(item => item["description"])?.description;

    let biosample = jsonData["@graph"].find(item => item["@type"] === "biosample");
    let organismId = biosample?.organism_classification?.["@id"];

    let image_acquisition = jsonData["@graph"].find(item => item["@type"] === "image_acquisition");
    let fbbiId = image_acquisition?.fbbi_id?.["@id"];

    let organismName = "";
    let imagingMethod = "";

    async function lookupOrganism(taxonId) {
        // taxonId e.g. 9606
        const orgJson = await getJson(`https://rest.ensembl.org/taxonomy/id/${taxonId}?content-type=application/json`);
        organismName = orgJson.name;
    }

    async function lookupImagingMethod(fbbiId) {
        // fbbiId e.g. FBbi_00000246
        // http://purl.obolibrary.org/obo/FBbi_00000246
        // https://www.ebi.ac.uk/ols4/api/ontologies/fbbi/terms/http%253A%252F%252Fpurl.obolibrary.org%252Fobo%252FFBbi_00000246
        const methodJson = await getJson(`https://www.ebi.ac.uk/ols4/api/ontologies/fbbi/terms/http%253A%252F%252Fpurl.obolibrary.org%252Fobo%252FFBbi_00000246`);
        imagingMethod = methodJson.label;
    }

    if (organismId) {
        lookupOrganism(organismId.replace("NCBI:txid", ""));
    }
    if (fbbiId) {
        lookupImagingMethod(fbbiId);
    }

    const report = [
        {name: "License", value: license, level: "SHOULD"},
        {name: "Name", value: name, level: "SUGGESTED"},
        {name: "Description", value: description, level: "SUGGESTED"},
    ];

    const warningSymbols = {
        SHOULD: "<span title='Missing SHOULD metadata'>&#x274C</span>",   // big red X
        SUGGESTED: "<span title='Missing SUGGESTED metadata' style='font-size: 20px;'>&times;</span>",   // black X
        RECOMMENDED: "",
        OK: "<span style='color: green;'>✓</span>",
    }

</script>


<ul>
    {#each report as {name, value, level}}
        <li>
            <strong>{name}:</strong>
            {#if value}
                {@html warningSymbols.OK }
                {#if value.startsWith("http")}
                    <a href={value} target="_blank">{value}</a>
                {:else}
                    {value}
                {/if}
            {:else}
                {@html warningSymbols[level] } Not found
            {/if}
        </li>
    {/each}
        <li>
            <strong>Organism:</strong>
            {#if organismId}
                {@html warningSymbols.OK } {organismId}  {organismName}
            {:else}
            {@html warningSymbols.SUGGESTED } Not found
            {/if}
        </li>

        <li>
            <strong>Imaging method:</strong>
            {#if fbbiId}
                {@html warningSymbols.OK } {fbbiId} {imagingMethod}
            {:else}
                {@html warningSymbols.SUGGESTED } Not found
            {/if}
        </li>
</ul>


<style>
    ul {
        list-style-type: none;
        padding: 0;
        text-align: left;
        margin: 15px;
    }

    li {
        margin-bottom: 10px;
    }

</style>
