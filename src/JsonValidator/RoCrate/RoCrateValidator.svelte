
<script>
    export let jsonData;

    let license = jsonData["@graph"].find(item => item["license"])?.license;
    let name = jsonData["@graph"].find(item => item["name"])?.name;
    let description = jsonData["@graph"].find(item => item["description"])?.description;

    const report = [
        {name: "Name", value: name},
        {name: "Description", value: description},
        {name: "License", value: license},
    ];
</script>


<ul>
    {#each report as {name, value}}
        <li>
            <strong>{name}:</strong>
            {#if value}
                <span style="color: green;">✓</span>
                {#if value.startsWith("http")}
                    <a href={value} target="_blank">{value}</a>
                {:else}
                    {value}
                {/if}
            {:else}
                <span style="color: red;">x</span> Not found
            {/if}
        </li>
    {/each}
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
