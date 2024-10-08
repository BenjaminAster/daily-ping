
export const database = await new class {
	#database: IDBDatabase;
	#storeName = "daily-things-done";
	constructor() {
		return (async () => {
			const request = window.indexedDB.open(new URL(document.baseURI).pathname, 1);
			request.addEventListener("upgradeneeded", () => {
				request.result.createObjectStore(this.#storeName, { keyPath: "date" });
			}, { once: true });
			request.addEventListener("error", () => console.error(request.error), { once: true });
			await new Promise((resolve) => request.addEventListener("success", resolve, { once: true }));
			this.#database = request.result;
			return this;
		})() as any as this;
	};

	async #operation(transactionMode: IDBTransactionMode, method: (argument?: any) => IDBRequest, argument?: any) {
		const store = this.#database.transaction(this.#storeName, transactionMode).objectStore(this.#storeName);
		const request: IDBRequest = method.call(store, argument);
		request.addEventListener("error", () => console.error(request.error), { once: true });
		await new Promise((resolve) => request.addEventListener("success", resolve, { once: true }));
		return request.result;
	};
	get = this.#operation.bind(this, "readonly", IDBObjectStore.prototype.get);
	getAll = this.#operation.bind(this, "readwrite", IDBObjectStore.prototype.getAll);
	put = this.#operation.bind(this, "readwrite", IDBObjectStore.prototype.put);
	delete = this.#operation.bind(this, "readwrite", IDBObjectStore.prototype.delete);
};

