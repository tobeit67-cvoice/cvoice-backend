type TaskInput<T> = {
	/**
	 * A task to run in the background.
	 *
	 * This function provides an `AbortController` that can be used along with HTTP request library to abort the task when needed.
	 */
	run: (abort: AbortController) => Promise<T>;
	/**
	 * A function that will be called when the task status is updated.
	 */
	onStatusUpdate?: (status: Status, result?: T) => Promise<any>;
};

type PendingBackgroundTask = {
	status: "pending";
};

type RunningBackgroundTask = {
	status: "running";
	promise: Promise<void>;
	abort: () => void;
};

type DoneBackgroundTask = {
	status: "done";
	promise: Promise<void>;
};

type ErrorBackgroundTask = {
	status: "error";
	error: any;
};

type BackgroundTask<T = any> = (
	| DoneBackgroundTask
	| ErrorBackgroundTask
	| RunningBackgroundTask
	| PendingBackgroundTask
) &
	TaskInput<T>;

export type Status = BackgroundTask["status"];

/**
 * A simple, in-memory queue for running background tasks.
 * Each task is identified by an ID, and its status can be queried at later time.
 *
 * @example
 * const queue = new BackgroundTaskQueue();
 * const id = "test-task";
 * queue.add(id, {
 * 	run: async () => {
 * 		await fetch("https://example.com");
 * 	}
 * });
 * await queue.run(id);
 * /// later
 * const data = await queue.get(id);
 * console.log("queue status", data.status);
 */
export default class BackgroundTaskQueue {
	private queue: Map<string, BackgroundTask> = new Map();

	public add<T>(id: string, task: TaskInput<T>) {
		if (this.queue.has(id)) {
			throw new Error("Task already exists.");
		}
		this.queue.set(id, { ...task, status: "pending" });
	}

	public async run(id: string) {
		const task = this.queue.get(id);
		if (!task) {
			throw new Error("Task not found.");
		}
		if (task.status === "running" || task.status === "done") {
			return task.promise;
		}
		const controller = new AbortController();
		const promise = task
			.run(controller)
			.then(async (data) => {
				this.queue.set(id, {
					...task,
					status: "done",
					promise,
				});
				if (task.onStatusUpdate) {
					await task.onStatusUpdate("done", data);
				}
			})
			.catch(async (error) => {
				this.queue.set(id, {
					...task,
					status: "error",
					error,
				});
				if (task.onStatusUpdate) {
					await task.onStatusUpdate("error");
				}
			});

		this.queue.set(id, {
			...task,
			status: "running",
			promise,
			abort: () => controller.abort(),
		});

		if (task.onStatusUpdate) {
			await task.onStatusUpdate("running");
		}
	}

	public get(id: string) {
		return this.queue.get(id);
	}

	public stop(id: string) {
		const task = this.queue.get(id);
		if (!task) {
			throw new Error("Task not found.");
		}
		if (task.status === "done") {
			return;
		}
		if (task.status === "running") {
			task.abort();
		}
		this.queue.set(id, {
			status: "error",
			run: task.run,
			error: new Error("Task aborted."),
		});
	}
}
