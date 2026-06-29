let user;

document.addEventListener("DOMContentLoaded", async () => {
    const grid = document.getElementById("pricing-grid");

    user = JSON.parse(
        document.getElementById("app").dataset.user
    );

    // attach once
    grid.addEventListener("click", (e) => {
        const btn = e.target.closest(".pricing-btn");

        if (!btn) return;

        const plan = btn.dataset.plan;
        const amount = btn.dataset.amount;

        initiatePay(plan, amount);
    });

    try {
        const res = await fetch("/paystack/getPlans");
        const data = await res.json();

        if (!data.data || data.data.length === 0) {
            grid.innerHTML = `<p class="pricing-empty">No plans available at the moment.</p>`;
            return;
        }

        grid.innerHTML = data.data.map((plan, index) => `
            <div class="pricing-card ${index === 1 ? "featured" : ""}">
                ${index === 1 ? `<span class="pricing-card-badge">Most popular</span>` : ""}

                <p class="pricing-card-name">${plan.name}</p>

                <p class="pricing-card-price">
                    ₦${(plan.amount / 100).toLocaleString()}
                    <span>/ ${plan.interval}</span>
                </p>

                <p class="pricing-card-desc">
                    ${plan.description || "Reliable truck rental for your needs."}
                </p>

                <hr class="pricing-divider">

                <button
                    class="pricing-btn ${index === 1 ? "primary" : ""}"
                    data-plan="${plan.plan_code}"
                    data-amount="${plan.amount}"
                >
                    Get started
                </button>
            </div>
        `).join("");

    } catch (err) {
        console.error(err);
    }
});


async function initiatePay(planCode, amount) {
    try {
        const res = await fetch(`/paystack/initiate-transaction/${user._id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: user.email,
                amount,
                plan: planCode,
            }),
        });

        const data = await res.json();

        if (data.data?.authorization_url) {
            window.location.href = data.data.authorization_url;
        } else {
            alert("Failed to initiate payment.");
        }

    } catch (err) {
        console.error("Payment error:", err);
    }
}