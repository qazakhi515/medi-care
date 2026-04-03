// TASK ZJ:
// Shunday function yozing, u berilgan array ichidagi
// raqamlarni qiymatini hisoblab qaytarsin.
// MASALAN: reduceNestedArray([1, [1, 2, [4]]]); return 8;
// Yuqoridagi misolda, array nested bo'lgan holdatda ham,
// bizning function ularning yig'indisini hisoblab qaytarmoqda.
// function reduceNestedArray(arr: (number | any[])[]): number {
// 	let sum = 0;
// 	for (const item of arr) {
// 		if (Array.isArray(item)) {
// 			sum += reduceNestedArray(item);
// 		} else {
// 			sum += item;
// 		}
// 	}
// 	return sum;
// }
// console.log(reduceNestedArray([1, [1, 2, [4]]])); // 8

function startCounter() {
	let count = 1;

	const interval = setInterval(() => {
		console.log(count);
		count++;

		if (count > 5) {
			clearInterval(interval);
		}
	}, 1000);
}

startCounter();
