export const DEMO_TEMPLATES = [
	{
		name: "Whitespace Control",
		description:
			"Demonstrates how whitespace trimming removes unnecessary spaces and blank lines around template blocks.",
		template: `
{{#
This block is a comment block. It will not be displayed.
Mutor.js uses '~' to control whitespace.
Whitespace is not trimmed by default.
~}}

<section class="demo">
	<h1>Products</h1>

	<ul>
	{{~ for product of products }}
		<li>
			<strong>{{ product.name }}</strong>
			- \${{ product.price }}
		</li>
	{{~ end }}
	</ul>

	<h2>Categories</h2>

	{{~ for category of categories }}
	<section class="category">
		<h3>{{ category.name }}</h3>

		<ul>
		{{~ for item of category.items }}
			<li>{{ item }}</li>
		{{~ end }}
		</ul>
	</section>
	{{~ end }}

	{{~ if showFooter }}
	<footer>
		<p>
			Showing {{ products.length }} featured products
		</p>
	</footer>
	{{~ end }}
</section>
`,
		context: {
			products: [
				{
					name: "Mechanical Keyboard",
					price: 129,
				},
				{
					name: "Gaming Mouse",
					price: 59,
				},
				{
					name: "4K Monitor",
					price: 499,
				},
			],

			categories: [
				{
					name: "Accessories",
					items: ["Mouse Pad", "USB Hub", "Webcam"],
				},
				{
					name: "Audio",
					items: ["Microphone", "Speakers", "Headphones"],
				},
			],

			showFooter: true,
		},

		expectedOutput: `
<section class="demo">
	<h1>Products</h1>

	<ul>
		<li>
			<strong>Mechanical Keyboard</strong>
			- $129
		</li>
		<li>
			<strong>Gaming Mouse</strong>
			- $59
		</li>
		<li>
			<strong>4K Monitor</strong>
			- $499
		</li>
	</ul>

	<h2>Categories</h2>

	<section class="category">
		<h3>Accessories</h3>

		<ul>
			<li>Mouse Pad</li>
			<li>USB Hub</li>
			<li>Webcam</li>
		</ul>
	</section>

	<section class="category">
		<h3>Audio</h3>

		<ul>
			<li>Microphone</li>
			<li>Speakers</li>
			<li>Headphones</li>
		</ul>
	</section>

	<footer>
		<p>
			Showing 3 featured products
		</p>
	</footer>
</section>
`,
	},
	{
		name: "E-Commerce Product Page",
		template: `
<section class="product-page">
	<h1>{{ product.name }}</h1>
	<p>{{ product.description }}</p>

	<div class="pricing">
		<span>Price: \${{ product.price }}</span>

		{{ if product.discount > 0 }}
			<p>Discount: {{ product.discount }}%</p>
			<p>
				Final Price:
				\${{ (product.price - (product.price * product.discount / 100)).toFixed(2) }}
			</p>
		{{ end }}
	</div>

	{{ if product.inStock }}
		<button>Add to Cart</button>
	{{ end }}

	{{ if !product.inStock }}
		<p>Out of Stock</p>
	{{ end }}

	<h3>Features</h3>
	<ul>
	{{ for feature of product.features }}
		<li>{{ feature }}</li>
	{{ end }}
	</ul>
</section>
`,
		context: {
			product: {
				name: "Mechanical Keyboard",
				description: "Hot-swappable RGB mechanical keyboard.",
				price: 129.99,
				discount: 15,
				inStock: true,
				features: ["RGB Lighting", "Hot-swappable switches", "USB-C"],
			},
		},
	},

	{
		name: "Admin Dashboard",
		template: `
<section class="dashboard">
	<h1>Welcome back, {{ admin.name }}</h1>

	<div class="stats">
		<div>Total Users: {{ stats.users }}</div>
		<div>Revenue: \${{ stats.revenue.toLocaleString() }}</div>
		<div>Pending Orders: {{ stats.pendingOrders }}</div>
	</div>

	<h2>Recent Orders</h2>

	<table>
		<tr>
			<th>ID</th>
			<th>Customer</th>
			<th>Status</th>
			<th>Total</th>
		</tr>

		{{ for order of orders }}
		<tr>
			<td>#{{ order.id }}</td>
			<td>{{ order.customer }}</td>
			<td>{{ order.status }}</td>
			<td>\${{ order.total }}</td>
		</tr>
		{{ end }}
	</table>
</section>
`,
		context: {
			admin: {
				name: "Victor",
			},
			stats: {
				users: 15420,
				revenue: 458920,
				pendingOrders: 12,
			},
			orders: [
				{
					id: 1021,
					customer: "Alice",
					status: "Processing",
					total: 220,
				},
				{
					id: 1022,
					customer: "Bob",
					status: "Delivered",
					total: 89,
				},
			],
		},
	},

	{
		name: "Blog Article Page",
		template: `
<article>
	<h1>{{ post.title }}</h1>

	<div class="meta">
		<span>By {{ post.author }}</span>
		<span>{{ post.date }}</span>
	</div>

	<p>{{ post.content }}</p>

	<h2>Tags</h2>
	<div class="tags">
	{{ for tag of post.tags }}
		<span>#{{ tag }}</span>
	{{ end }}
	</div>

	<h2>Comments</h2>

	{{ if comments.length === 0 }}
		<p>No comments yet.</p>
	{{ end }}

	{{ for comment of comments }}
	<div class="comment">
		<h4>{{ comment.user }}</h4>
		<p>{{ comment.message }}</p>
	</div>
	{{ end }}
</article>
`,
		context: {
			post: {
				title: "Building a Template Engine from Scratch",
				author: "Victor Onah",
				date: "May 11, 2026",
				content:
					"This article explains how tokenization, parsing, and AST execution work in template engines.",
				tags: ["javascript", "compiler", "templating", "ast"],
			},
			comments: [
				{
					user: "Alice",
					message: "Excellent explanation.",
				},
				{
					user: "John",
					message: "Very informative article.",
				},
			],
		},
	},

	{
		name: "Authentication UI",
		template: `
<section class="auth-page">
	{{ if user.loggedIn }}
		<h1>Welcome, {{ user.name }}</h1>

		{{ if user.role === "admin" }}
			<p>Access Level: Administrator</p>
		{{ end }}

		{{ if user.role === "editor" }}
			<p>Access Level: Editor</p>
		{{ end }}

		<button>Logout</button>
	{{ end }}

	{{ if !user.loggedIn }}
		<h1>Please Sign In</h1>

		<form>
			<input placeholder="Email" />
			<input placeholder="Password" type="password" />
			<button>Login</button>
		</form>
	{{ end }}
</section>
`,
		context: {
			user: {
				loggedIn: true,
				name: "Victor",
				role: "admin",
			},
		},
	},

	{
		name: "Reusable Components",
		template: `
{{ Mutor::include("navbar") }}

<main>
	<h1>{{ page.title }}</h1>
	<p>{{ page.description }}</p>

	<section class="cards">
	{{ for feature of features }}
		{{ Mutor::include("featureCard", feature) }}
	{{ end }}
	</section>
</main>

{{ Mutor::include("footer") }}
`,
		context: {
			page: {
				title: "Mutor.js Playground",
				description:
					"Experiment with templates, expressions, loops, and components.",
			},
			features: [
				{
					title: "Fast Parsing",
					description: "Efficient tokenizer and AST pipeline.",
				},
				{
					title: "Secure Execution",
					description: "Sandboxed expression evaluation.",
				},
			],
		},
		components: {
			navbar: `
<nav>
	<h2>Mutor.js</h2>
</nav>
`,
			featureCard: `
<div class="card">
	<h3>{{ title }}</h3>
	<p>{{ description }}</p>
</div>
`,
			footer: `
<footer>
	<p>© 2026 Mutor.js</p>
</footer>
`,
		},
	},

	{
		name: "Team Directory",
		template: `
<section>
	<h1>Engineering Team</h1>

	{{ for member of team }}
	<div class="member">
		<h2>{{ member.name }}</h2>
		<p>{{ member.role }}</p>

		{{ if member.online }}
			<span>🟢 Online</span>
		{{ end }}

		{{ if !member.online }}
			<span>⚫ Offline</span>
		{{ end }}

		<h4>Skills</h4>

		<ul>
		{{ for skill of member.skills }}
			<li>{{ skill }}</li>
		{{ end }}
		</ul>
	</div>
	{{ end }}
</section>
`,
		context: {
			team: [
				{
					name: "Alice",
					role: "Frontend Engineer",
					online: true,
					skills: ["React", "TypeScript", "TailwindCSS"],
				},
				{
					name: "Bob",
					role: "Backend Engineer",
					online: false,
					skills: ["Node.js", "MongoDB", "Docker"],
				},
			],
		},
	},

	{
		name: "Invoice Generator",
		template: `
<section class="invoice">
	<h1>Invoice #{{ invoice.id }}</h1>

	<p>Customer: {{ invoice.customer }}</p>

	<table>
		<tr>
			<th>Item</th>
			<th>Qty</th>
			<th>Price</th>
			<th>Total</th>
		</tr>

		{{ for item of invoice.items }}
		<tr>
			<td>{{ item.name }}</td>
			<td>{{ item.quantity }}</td>
			<td>\${{ item.price }}</td>
			<td>\${{ item.quantity * item.price }}</td>
		</tr>
		{{ end }}
	</table>
</section>
`,
		context: {
			invoice: {
				id: "INV-2026-001",
				customer: "Acme Inc.",
				items: [
					{
						name: "Hosting",
						quantity: 1,
						price: 99,
					},
					{
						name: "API Requests",
						quantity: 5000,
						price: 0.01,
					},
				],
			},
		},
	},

	{
		name: "Error Handling Demo",
		template: `
<h1>{{ user.name }}</h1>

<p>Email: {{ user.email }}</p>

<p>
	Account Type:
	{{ user.account.type.toUpperCase() }}
</p>

<p>
	Undefined Variable:
	{{ unknownVariable }}
</p>
`,
		context: {
			user: {
				name: "Victor",
				email: "victor@example.com",
			},
		},
	},
];
