<script>
    let show = false;
    let hideTimeout;

    function showTooltip() {
        clearTimeout(hideTimeout);
        show = true;
    }

    function hideTooltip() {
        hideTimeout = setTimeout(() => (show = false), 400);
    }
</script>

<button
    type="button"
    class="tooltip"
    on:mouseenter={showTooltip}
    on:mouseleave={hideTooltip}
    on:focus={showTooltip}
    on:blur={hideTooltip}
>
    <svg class="icon" width="18" height="18" viewBox="0 0 24 24">
        <circle
            cx="12"
            cy="12"
            r="10"
            stroke="#343a40"
            stroke-width="2.6"
            opacity="0.9"
            fill="none"
        />
        <text
            x="12.2"
            y="17.4"
            text-anchor="middle"
            font-size="15"
            opacity="0.9"
            fill="#343a40">?</text
        >
    </svg>

    {#if show}
        <p class="tooltip-content">
            RO-Crate is not required, but may be used to add extra metadata.
            <a
                href="https://www.researchobject.org/ro-crate/ome"
                target="_blank"
            >
                More details →
            </a><slot />
        </p>
    {/if}
</button>

<style>
    .tooltip {
        position: relative;
        display: inline-flex;
        align-items: center;
        margin-left: 4px;

        background: none;
        border: none;
        padding: 0;
        cursor: help;
    }

    .tooltip:focus-visible {
        outline: 2px solid #fff;
        outline-offset: 2px;
    }

    .tooltip-content {
        font-weight: normal;

        position: absolute;
        opacity: 0.95;
        top: 28px;
        left: 50%;
        transform: translateX(-50%);
        width: 240px;

        background: #263749;
        backdrop-filter: blur(4px);

        padding: 10px 12px;
        border-radius: 6px;
        color: #fff;
        font-size: 0.86rem;
        line-height: 1.35;

        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
        z-index: 20;

        animation: fadeIn 120ms ease-out 120ms;
    }

    .tooltip-content a {
        color: #a7d8ff;
        text-decoration: none;
    }

    .tooltip-content a:hover {
        text-decoration: underline;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translate(-50%, -2px);
        }
        to {
            opacity: 1;
            transform: translate(-50%, 0);
        }
    }
</style>
