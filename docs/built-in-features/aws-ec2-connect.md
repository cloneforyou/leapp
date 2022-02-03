You can directly connect from Leapp to an AWS EC2 instance through AWS System Manager (AWS SSM).

!!! Info

    To setup SSM follow [this](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager-getting-started.html) guide.

![](../../images/screens/newuxui/aws-ssm.png?style=center-img)

To connect properly follow these steps:

1. Right-click on a suitable AWS session to open the contextual menu
2. Click on View SSM sessions
3. Select an AWS region in which your instance is located
4. Wait for Leapp to load your instances
5. Select the instance and click connect
6. Wait for the terminal to open
7. Focus the terminal and write ```/bin/bash```; press  ++return++  and you'll be inside your Instance's terminal

<video width="100%" autoplay="true" loop="true" control="false"> <source src="../../videos/newuxui/ssm.mp4" type="video/mp4"> </video>

!!! Warning

    If the user is not granted the right permissions, the operation will fail and Leapp will throw an error message.


