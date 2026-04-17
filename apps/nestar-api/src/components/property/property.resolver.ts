import { Resolver } from '@nestjs/graphql';
import { PropertyService } from './property.service';

@Resolver()
export class PropertyResolver {
	constructor(private readonly propertyService: PropertyService) {}

	// @Mutation(() => Member)
	// public async signup(@Args('input') input: PropertyInput): Promise<Member> {
	//     console.log('Mutation: signup');
	//     return await this.propertyService.signup(input);
	// }
}
