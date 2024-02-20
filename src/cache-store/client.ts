
class OtpCacheStore<K, V> {
	private cache: Map<K, V>;

	constructor() {
		this.cache = new Map<K, V>();
	}

	set( key: K, value: V ): void {
		this.cache.set( key, value );
	}

	get( key: K ): V | undefined {
		return this.cache.get( key );
	}

	expire( key: K ) {
		this.cache.delete( key );
	}

	has( key: K ): boolean {
		return this.cache.has( key );
	}

	clear(): void {
		this.cache.clear();
	}

	keys(): IterableIterator<K> {
		return this.cache.keys();
	}

	values(): IterableIterator<V> {
		return this.cache.values();
	}

	entries(): IterableIterator<[K, V]> {
		return this.cache.entries();
	}

	size(): number {
		return this.cache.size;
	}
}

// Example usage:
export const otpCacheStore = new OtpCacheStore<string, string>();
